import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiFolder, FiFile, FiClock, FiZap, FiCode, FiMessageSquare, FiTerminal } from 'react-icons/fi';
import useWorkspaceStore from '../store/workspaceStore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { workspaces, fetchWorkspaces, createWorkspace, isLoading, error } = useWorkspaceStore();
  const [stats, setStats] = useState({
    totalWorkspaces: 0,
    totalFiles: 0,
    totalChats: 0,
    recentActivity: []
  });

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (workspaces.length > 0) {
      setStats({
        totalWorkspaces: workspaces.length,
        totalFiles: 0, // Will be fetched from API when available
        totalChats: 0, // Will be fetched from API when available
        recentActivity: [] // Will be fetched from API when available
      });
    } else {
      setStats({
        totalWorkspaces: 0,
        totalFiles: 0,
        totalChats: 0,
        recentActivity: []
      });
    }
  }, [workspaces]);

  const handleCreateWorkspace = async () => {
    const name = prompt('Enter workspace name:');
    if (name) {
      const result = await createWorkspace({ name });
      if (result.success) {
        toast.success('Workspace created successfully!');
        // Stay on dashboard to show the new workspace in the list
      } else {
        toast.error(result.error || 'Failed to create workspace');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchWorkspaces} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-editor-text-dim">
            Here's what's happening with your projects today.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="panel">
            <div className="panel-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-editor-text-dim">Workspaces</p>
                  <p className="text-2xl font-bold text-editor-text">{stats.totalWorkspaces}</p>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-lg">
                  <FiFolder className="text-blue-400" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-editor-text-dim">Files</p>
                  <p className="text-2xl font-bold text-editor-text">{stats.totalFiles}</p>
                </div>
                <div className="p-3 bg-green-900/20 rounded-lg">
                  <FiFile className="text-green-400" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-editor-text-dim">AI Chats</p>
                  <p className="text-2xl font-bold text-editor-text">{stats.totalChats}</p>
                </div>
                <div className="p-3 bg-purple-900/20 rounded-lg">
                  <FiMessageSquare className="text-purple-400" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-editor-text-dim">Active Today</p>
                  <p className="text-2xl font-bold text-editor-text">4h 32m</p>
                </div>
                <div className="p-3 bg-orange-900/20 rounded-lg">
                  <FiClock className="text-orange-400" size={24} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-xl font-semibold text-editor-text mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleCreateWorkspace}
              className="panel hover:border-editor-accent transition-colors group"
            >
              <div className="panel-content flex items-center space-x-4">
                <div className="p-3 bg-editor-accent rounded-lg group-hover:scale-110 transition-transform">
                  <FiPlus className="text-white" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-editor-text">New Workspace</p>
                  <p className="text-sm text-editor-text-dim">Create a new project</p>
                </div>
              </div>
            </button>

            <button className="panel hover:border-editor-accent transition-colors group">
              <div className="panel-content flex items-center space-x-4">
                <div className="p-3 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
                  <FiCode className="text-white" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-editor-text">Quick Code</p>
                  <p className="text-sm text-editor-text-dim">Start coding instantly</p>
                </div>
              </div>
            </button>

            <button className="panel hover:border-editor-accent transition-colors group">
              <div className="panel-content flex items-center space-x-4">
                <div className="p-3 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                  <FiZap className="text-white" size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-editor-text">AI Assistant</p>
                  <p className="text-sm text-editor-text-dim">Get AI help</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Recent Workspaces */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-editor-text">Recent Workspaces</h2>
            <button
              onClick={handleCreateWorkspace}
              className="btn-primary text-sm"
            >
              Create New
            </button>
          </div>

          {workspaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace) => (
                <div
                  key={workspace._id}
                  onClick={() => navigate(`/workspace/${workspace._id}`)}
                  className="panel hover:border-editor-accent cursor-pointer transition-all duration-200 group"
                >
                  <div className="panel-content">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-editor-accent rounded-lg">
                        <FiFolder className="text-white" size={20} />
                      </div>
                      <span className="text-xs text-editor-text-dim">
                        {new Date(workspace.lastAccessed).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-editor-text mb-1 group-hover:text-editor-accent transition-colors">
                      {workspace.name}
                    </h3>
                    <p className="text-sm text-editor-text-dim line-clamp-2">
                      {workspace.description || 'No description'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="panel text-center py-12">
              <FiFolder className="mx-auto text-editor-text-dim mb-4" size={48} />
              <h3 className="text-lg font-medium text-editor-text mb-2">No workspaces yet</h3>
              <p className="text-editor-text-dim mb-4">Create your first workspace to get started</p>
              <button onClick={handleCreateWorkspace} className="btn-primary">
                Create Workspace
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold text-editor-text mb-4">Recent Activity</h2>
          <div className="panel">
            <div className="panel-content">
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="p-2 bg-editor-hover rounded-lg">
                      {activity.type === 'file' && <FiFile className="text-blue-400" size={16} />}
                      {activity.type === 'chat' && <FiMessageSquare className="text-purple-400" size={16} />}
                      {activity.type === 'workspace' && <FiFolder className="text-green-400" size={16} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-editor-text">
                        {activity.name} in {activity.workspace}
                      </p>
                      <p className="text-xs text-editor-text-dim">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
