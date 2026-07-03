import { create } from 'zustand';
import api from '../services/api';

const getAuthToken = () => {
  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) return '';

  try {
    return JSON.parse(authStorage)?.state?.token || '';
  } catch (error) {
    console.error('Failed to parse auth token from local storage', error);
    return '';
  }
};

const readErrorResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return data.error || data.message || `Request failed with ${response.status}`;
    }

    const text = await response.text();
    return text || `Request failed with ${response.status}`;
  } catch (error) {
    console.error('Failed to parse AI error response', error);
    return `Request failed with ${response.status}`;
  }
};

const getNetworkErrorMessage = (error) => {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return `Backend API is unreachable at ${api.defaults.baseURL}. Start the backend server and try again.`;
  }

  return error.message || 'Failed to send message';
};

const extractAssistantContent = (payload) => {
  const data = payload?.data || payload;
  const message = data?.message || data?.messages?.at?.(-1);

  return (
    data?.content ||
    data?.response ||
    data?.reply ||
    data?.text ||
    data?.answer ||
    message?.content ||
    ''
  );
};

const finalizeAssistantMessage = (set, { content, chatId, title, timestamp }) => {
  set((state) => {
    let finalizedExistingMessage = false;
    const messages = state.messages.map((msg) => {
      if (msg.role === 'assistant' && msg.isStreaming) {
        finalizedExistingMessage = true;
        return {
          ...msg,
          content,
          timestamp: timestamp || msg.timestamp || new Date(),
          isStreaming: false
        };
      }

      return msg;
    });

    if (!finalizedExistingMessage && content) {
      messages.push({
        role: 'assistant',
        content,
        timestamp: timestamp || new Date()
      });
    }

    return {
      messages,
      currentChat: chatId ? { _id: chatId, title } : state.currentChat,
      chats: chatId && !state.chats.some((chat) => chat._id === chatId)
        ? [{ _id: chatId, title, lastMessageAt: new Date() }, ...state.chats]
        : state.chats,
      isLoading: false,
      isStreaming: false
    };
  });
};

const useChatStore = create((set, get) => ({
  // State
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,

  // Actions
  fetchChats: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/ai/chats/${workspaceId}`);
      const { data } = response.data;
      
      set({
        chats: data,
        isLoading: false
      });
      
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch chats',
        isLoading: false
      });
      return [];
    }
  },

  fetchChat: async (workspaceId, chatId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/ai/chats/${workspaceId}/${chatId}`);
      const { data } = response.data;
      
      set({
        currentChat: data,
        messages: data.messages || [],
        isLoading: false
      });
      
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch chat',
        isLoading: false
      });
      return null;
    }
  },

  sendMessage: async (workspaceId, message, chatId = null, options = {}) => {
    set({ isLoading: true, isStreaming: true, error: null });
    
    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    set((state) => ({
      messages: [...state.messages, userMessage]
    }));

    try {
      const token = getAuthToken();
      const response = await fetch(`${api.defaults.baseURL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message,
          workspaceId,
          ...(chatId ? { chatId } : {}),
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(await readErrorResponse(response));
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const payload = await response.json();
        const assistantContent = extractAssistantContent(payload);

        if (!assistantContent) {
          throw new Error('AI response did not include a message');
        }

        finalizeAssistantMessage(set, {
          content: assistantContent,
          chatId: payload?.data?.chatId || payload?.chatId,
          title: payload?.data?.title || payload?.title,
          timestamp: payload?.data?.timestamp || payload?.timestamp || new Date()
        });

        return {
          success: true,
          chatId: payload?.data?.chatId || payload?.chatId
        };
      }

      if (!response.body) {
        throw new Error('AI response stream was empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let sseBuffer = '';
      let completed = false;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const events = sseBuffer.split('\n\n');
        sseBuffer = events.pop() || '';
        
        for (const event of events) {
          const dataLine = event
            .split('\n')
            .find((line) => line.startsWith('data: '));

          if (dataLine) {
            try {
              const data = JSON.parse(dataLine.slice(6));
              
              if (data.isComplete) {
                if (data.error) {
                  throw new Error(data.error);
                }

                completed = true;
                finalizeAssistantMessage(set, {
                  content: data.message?.content || assistantMessage,
                  chatId: data.chatId,
                  title: data.title,
                  timestamp: data.message?.timestamp || new Date()
                });
                
                return { success: true, chatId: data.chatId };
              } else if (data.content) {
                assistantMessage += data.content;
                
                // Update streaming message
                set((state) => {
                  const newMessages = [...state.messages];
                  const lastMessage = newMessages[newMessages.length - 1];
                  
                  if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                    newMessages[newMessages.length - 1] = {
                      ...lastMessage,
                      content: assistantMessage
                    };
                  } else {
                    newMessages.push({
                      role: 'assistant',
                      content: assistantMessage,
                      timestamp: new Date(),
                      isStreaming: true
                    });
                  }
                  
                  return { messages: newMessages };
                });
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              if (parseError instanceof SyntaxError) {
                console.error('Failed to parse AI stream event', { event, error: parseError });
              } else {
                throw parseError;
              }
            }
          }
        }
      }

      if (sseBuffer.trim()) {
        console.warn('AI stream ended with an incomplete SSE frame', { sseBuffer });
      }

      if (!completed) {
        throw new Error('AI response stream ended before completion');
      }
    } catch (error) {
      const errorMessage = getNetworkErrorMessage(error);

      console.error('AI chat request failed', {
        message: errorMessage,
        originalMessage: error.message,
        apiBaseURL: api.defaults.baseURL,
        workspaceId,
        chatId
      });

      set({
        error: errorMessage,
        isLoading: false,
        isStreaming: false,
        messages: get().messages.filter((msg) => !msg.isStreaming)
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  generateCode: async (prompt, language, context) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/ai/generate', {
        prompt,
        language,
        context
      });
      
      set({ isLoading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to generate code',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to generate code' 
      };
    }
  },

  explainCode: async (code, language) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/ai/explain', {
        code,
        language
      });
      
      set({ isLoading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to explain code',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to explain code' 
      };
    }
  },

  refactorCode: async (code, language, instructions) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/ai/refactor', {
        code,
        language,
        instructions
      });
      
      set({ isLoading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to refactor code',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to refactor code' 
      };
    }
  },

  fixBugs: async (code, language, errorDescription) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/ai/fix-bugs', {
        code,
        language,
        errorDescription
      });
      
      set({ isLoading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fix bugs',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fix bugs' 
      };
    }
  },

  reviewCode: async (code, language) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/ai/review', {
        code,
        language
      });
      
      set({ isLoading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to review code',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to review code' 
      };
    }
  },

  deleteChat: async (workspaceId, chatId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/ai/chats/${workspaceId}/${chatId}`);
      
      set((state) => ({
        chats: state.chats.filter(c => c._id !== chatId),
        currentChat: state.currentChat?._id === chatId ? null : state.currentChat,
        messages: state.currentChat?._id === chatId ? [] : state.messages,
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to delete chat',
        isLoading: false
      });
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete chat' 
      };
    }
  },

  setCurrentChat: (chat) => {
    set({ 
      currentChat: chat,
      messages: chat?.messages || []
    });
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  clearError: () => {
    set({ error: null });
  }
}));

export default useChatStore;
