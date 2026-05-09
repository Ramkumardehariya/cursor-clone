import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiSave, FiEye, FiEyeOff, FiMonitor, FiType, FiZap, FiDatabase } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { MONACO_THEMES, FONT_SIZES, TAB_SIZES, WORD_WRAP_OPTIONS } from '../utils/constants';

const SettingsPage = () => {
  const { user, updateProfile } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [editorSettings, setEditorSettings] = useState({
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 4,
    wordWrap: 'on',
    minimap: true,
    lineNumbers: 'on',
    autoSave: true,
    autoSaveDelay: 1000
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'editor', name: 'Editor', icon: FiType },
    { id: 'ai', name: 'AI Settings', icon: FiZap },
    { id: 'account', name: 'Account', icon: FiDatabase },
  ];

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    
    const result = await updateProfile(profileData);
    
    if (result.success) {
      // Show success message
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile: ' + result.error);
    }
    
    setIsLoading(false);
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    // Password update logic would go here
    // For now, just show a success message
    alert('Password updated successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    setIsLoading(false);
  };

  const handleEditorSettingsUpdate = () => {
    // Save editor settings to localStorage
    localStorage.setItem('editor-settings', JSON.stringify(editorSettings));
    alert('Editor settings saved!');
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-editor-text mb-4">Profile Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim" />
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input-field pl-10 w-full"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="input-field pl-10 w-full"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              value={profileData.avatar}
              onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
              className="input-field w-full"
              placeholder="Enter avatar URL"
            />
          </div>

          <button
            onClick={handleProfileUpdate}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <FiSave />
            )}
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-editor-text mb-4">Change Password</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Current Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input-field pl-10 pr-10 w-full"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim hover:text-editor-text"
              >
                {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field pl-10 pr-10 w-full"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim hover:text-editor-text"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="input-field w-full"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={handlePasswordUpdate}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <FiSave />
            )}
            <span>Update Password</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderEditorTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-editor-text mb-4">Editor Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Theme
            </label>
            <select
              value={editorSettings.theme}
              onChange={(e) => setEditorSettings({ ...editorSettings, theme: e.target.value })}
              className="input-field w-full"
            >
              {MONACO_THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Font Size
            </label>
            <select
              value={editorSettings.fontSize}
              onChange={(e) => setEditorSettings({ ...editorSettings, fontSize: parseInt(e.target.value) })}
              className="input-field w-full"
            >
              {FONT_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Tab Size
            </label>
            <select
              value={editorSettings.tabSize}
              onChange={(e) => setEditorSettings({ ...editorSettings, tabSize: parseInt(e.target.value) })}
              className="input-field w-full"
            >
              {TAB_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Word Wrap
            </label>
            <select
              value={editorSettings.wordWrap}
              onChange={(e) => setEditorSettings({ ...editorSettings, wordWrap: e.target.value })}
              className="input-field w-full"
            >
              {WORD_WRAP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="minimap"
              checked={editorSettings.minimap}
              onChange={(e) => setEditorSettings({ ...editorSettings, minimap: e.target.checked })}
              className="rounded border-editor-border bg-editor-sidebar text-editor-accent focus:ring-editor-accent"
            />
            <label htmlFor="minimap" className="text-sm text-editor-text">
              Show Minimap
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="lineNumbers"
              checked={editorSettings.lineNumbers}
              onChange={(e) => setEditorSettings({ ...editorSettings, lineNumbers: e.target.checked })}
              className="rounded border-editor-border bg-editor-sidebar text-editor-accent focus:ring-editor-accent"
            />
            <label htmlFor="lineNumbers" className="text-sm text-editor-text">
              Show Line Numbers
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoSave"
              checked={editorSettings.autoSave}
              onChange={(e) => setEditorSettings({ ...editorSettings, autoSave: e.target.checked })}
              className="rounded border-editor-border bg-editor-sidebar text-editor-accent focus:ring-editor-accent"
            />
            <label htmlFor="autoSave" className="text-sm text-editor-text">
              Auto Save Files
            </label>
          </div>

          {editorSettings.autoSave && (
            <div>
              <label className="block text-sm font-medium text-editor-text mb-2">
                Auto Save Delay (ms)
              </label>
              <input
                type="number"
                value={editorSettings.autoSaveDelay}
                onChange={(e) => setEditorSettings({ ...editorSettings, autoSaveDelay: parseInt(e.target.value) })}
                className="input-field w-full"
                min="100"
                max="10000"
                step="100"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleEditorSettingsUpdate}
          className="btn-primary flex items-center space-x-2 mt-6"
        >
          <FiSave />
          <span>Save Editor Settings</span>
        </button>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-editor-text mb-4">AI Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              AI Model
            </label>
            <select className="input-field w-full">
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Temperature (0-2)
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              defaultValue="0.7"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-editor-text-dim">
              <span>Conservative</span>
              <span>Creative</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-editor-text mb-2">
              Max Tokens
            </label>
            <select className="input-field w-full">
              <option value="512">512</option>
              <option value="1024">1024</option>
              <option value="2048">2048</option>
              <option value="4096">4096</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoComplete"
              defaultChecked
              className="rounded border-editor-border bg-editor-sidebar text-editor-accent focus:ring-editor-accent"
            />
            <label htmlFor="autoComplete" className="text-sm text-editor-text">
              Enable AI Auto Complete
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="streaming"
              defaultChecked
              className="rounded border-editor-border bg-editor-sidebar text-editor-accent focus:ring-editor-accent"
            />
            <label htmlFor="streaming" className="text-sm text-editor-text">
              Enable Streaming Responses
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-editor-text mb-4">Usage Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="panel">
            <div className="panel-content text-center">
              <p className="text-2xl font-bold text-editor-accent">1,234</p>
              <p className="text-sm text-editor-text-dim">Total Requests</p>
            </div>
          </div>
          
          <div className="panel">
            <div className="panel-content text-center">
              <p className="text-2xl font-bold text-green-400">45,678</p>
              <p className="text-sm text-editor-text-dim">Tokens Used</p>
            </div>
          </div>
          
          <div className="panel">
            <div className="panel-content text-center">
              <p className="text-2xl font-bold text-blue-400">89</p>
              <p className="text-sm text-editor-text-dim">This Month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-editor-text mb-4">Account Information</h3>
        
        <div className="space-y-4">
          <div className="panel">
            <div className="panel-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-editor-text">Account Type</p>
                  <p className="text-sm text-editor-text-dim">Free Plan</p>
                </div>
                <button className="btn-secondary text-sm">
                  Upgrade
                </button>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-editor-text">Member Since</p>
                  <p className="text-sm text-editor-text-dim">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-editor-text">Last Login</p>
                  <p className="text-sm text-editor-text-dim">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-editor-text mb-4">Danger Zone</h3>
        
        <div className="panel border-red-500/50">
          <div className="panel-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-editor-text">Delete Account</p>
                <p className="text-sm text-editor-text-dim">Permanently delete your account and all data</p>
              </div>
              <button className="btn-secondary text-red-400 hover:bg-red-900/20">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gradient mb-8">Settings</h1>
        
        <div className="flex space-x-1 mb-8 border-b border-editor-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-editor-accent text-editor-text'
                  : 'border-transparent text-editor-text-dim hover:text-editor-text'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'editor' && renderEditorTab()}
          {activeTab === 'ai' && renderAITab()}
          {activeTab === 'account' && renderAccountTab()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
