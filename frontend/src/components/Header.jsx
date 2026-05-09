import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, 
  FiSearch, 
  FiBell, 
  FiSettings, 
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const Header = ({ user, sidebarCollapsed, onToggleSidebar }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const { logout, updateProfile } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const notifications = [
    { id: 1, title: 'New workspace created', time: '2 hours ago', read: false },
    { id: 2, title: 'AI response completed', time: '5 hours ago', read: true },
    { id: 3, title: 'File shared with you', time: '1 day ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-editor-toolbar border-b border-editor-border h-14 flex items-center justify-between px-4">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-editor-hover text-editor-text transition-colors"
        >
          <FiMenu size={18} />
        </button>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search files, commands, or AI prompts..."
            className="w-64 lg:w-96 bg-editor-sidebar border border-editor-border rounded-lg px-3 py-1.5 text-sm text-editor-text placeholder-editor-text-dim focus:outline-none focus:border-editor-accent focus:ring-1 focus:ring-editor-accent"
          />
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim" size={16} />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-editor-hover text-editor-text transition-colors"
          title="Toggle theme"
        >
          {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-editor-hover text-editor-text transition-colors relative"
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-editor-sidebar border border-editor-border rounded-lg shadow-lg z-50"
              >
                <div className="p-3 border-b border-editor-border">
                  <h3 className="font-semibold text-editor-text">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-editor-hover cursor-pointer border-b border-editor-border last:border-b-0 ${
                        !notification.read ? 'bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-editor-text">{notification.title}</p>
                          <p className="text-xs text-editor-text-dim mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-editor-hover transition-colors"
          >
            <div className="w-6 h-6 bg-editor-accent rounded-full flex items-center justify-center">
              <FiUser size={14} className="text-white" />
            </div>
            <span className="text-sm text-editor-text hidden md:block">
              {user?.name || 'User'}
            </span>
            <FiChevronDown size={14} className="text-editor-text-dim" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-editor-sidebar border border-editor-border rounded-lg shadow-lg z-50"
              >
                <div className="p-3 border-b border-editor-border">
                  <p className="font-semibold text-editor-text">{user?.name}</p>
                  <p className="text-sm text-editor-text-dim">{user?.email}</p>
                </div>
                
                <div className="py-2">
                  <button
                    onClick={() => {
                      // Navigate to settings
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-editor-text hover:bg-editor-hover flex items-center space-x-2"
                  >
                    <FiSettings size={16} />
                    <span>Settings</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 flex items-center space-x-2"
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
