import { create } from 'zustand';
import api from '../services/api';

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state.token : ''}`
        },
        body: JSON.stringify({
          message,
          workspaceId,
          chatId,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.isComplete) {
                // Add final assistant message
                const finalMessage = {
                  role: 'assistant',
                  content: assistantMessage,
                  timestamp: new Date()
                };
                
                set((state) => ({
                  messages: [...state.messages, finalMessage],
                  currentChat: data.chatId ? { _id: data.chatId, title: data.title } : state.currentChat,
                  isLoading: false,
                  isStreaming: false
                }));
                
                return { success: true, chatId: data.chatId };
              } else if (data.content) {
                assistantMessage += data.content;
                
                // Update streaming message
                set((state) => {
                  const newMessages = [...state.messages];
                  const lastMessage = newMessages[newMessages.length - 1];
                  
                  if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                    lastMessage.content = assistantMessage;
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
              console.error('Parse error:', parseError);
            }
          }
        }
      }
    } catch (error) {
      set({
        error: error.message || 'Failed to send message',
        isLoading: false,
        isStreaming: false
      });
      
      return { 
        success: false, 
        error: error.message || 'Failed to send message' 
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
