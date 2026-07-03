import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiFolder, 
  FiSettings, 
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiSearch
} from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import useWorkspaceStore from '../store/workspaceStore';
import toast from 'react-hot-toast';

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { workspaces, createWorkspace } = useWorkspaceStore();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const handleCreateWorkspace = async () => {
    const workspaceName = prompt('Enter workspace name:');
    if (workspaceName) {
      const result = await createWorkspace({ name: workspaceName });
      if (result.success) {
        toast.success('Workspace created successfully!');
      } else {
        toast.error(result.error || 'Failed to create workspace');
      }
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/workspaces', icon: FiFolder, label: 'Workspaces' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <div className="h-full flex flex-col bg-editor-sidebar dark:bg-editor-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-editor-border dark:border-editor-border">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 1 }}
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-bold text-gradient whitespace-nowrap"
          >
            {!collapsed && 'Cursor Clone'}
          </motion.h1>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-editor-hover dark:hover:bg-editor-hover text-editor-text-dim dark:text-editor-text-dim hover:text-editor-text dark:hover:text-editor-text transition-colors"
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item flex items-center space-x-3 rounded-lg transition-all duration-200 ${
                  isActive ? 'sidebar-item-active' : ''
                }`
              }
            >
              <item.icon className="flex-shrink-0" size={18} />
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: collapsed ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            </NavLink>
          ))}
        </div>

        {/* Workspaces Section */}
        {!collapsed && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-editor-text-dim dark:text-editor-text-dim uppercase tracking-wider">
                Workspaces
              </h3>
              <button
                onClick={handleCreateWorkspace}
                className="p-1 rounded hover:bg-editor-hover dark:hover:bg-editor-hover text-editor-text-dim dark:text-editor-text-dim hover:text-editor-text dark:hover:text-editor-text transition-colors"
                title="Create workspace"
              >
                <FiPlus size={14} />
              </button>
            </div>
            
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {workspaces.slice(0, 5).map((workspace) => (
                <NavLink
                  key={workspace._id}
                  to={`/workspace/${workspace._id}`}
                  className={({ isActive }) =>
                    `sidebar-item flex items-center space-x-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'sidebar-item-active' : ''
                    }`
                  }
                >
                  <FiFolder size={14} />
                  <span className="text-sm truncate">{workspace.name}</span>
                </NavLink>
              ))}
              
              {workspaces.length === 0 && (
                <p className="text-xs text-editor-text-dim dark:text-editor-text-dim text-center py-2">
                  No workspaces yet
                </p>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-editor-border dark:border-editor-border">
        <button
          onClick={handleLogout}
          className="sidebar-item flex items-center space-x-3 rounded-lg w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <FiLogOut size={18} />
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
