import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiFolder, FiCalendar, FiFileText, FiMoreVertical, FiEdit, FiTrash2 } from 'react-icons/fi';
import useWorkspaceStore from '../store/workspaceStore';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const WorkspacesPage = () => {
  const navigate = useNavigate();
  const { workspaces, fetchWorkspaces, createWorkspace, deleteWorkspace, isLoading, error } = useWorkspaceStore();
  const [showMenu, setShowMenu] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateWorkspace = async () => {
    const name = prompt('Enter workspace name:');
    if (name) {
      const description = prompt('Enter description (optional):');
      const result = await createWorkspace({ name, description: description || '' });
      if (result.success) {
        toast.success('Workspace created successfully!');
        // Stay on workspaces page to show the new workspace in the list
      } else {
        toast.error(result.error || 'Failed to create workspace');
      }
    }
  };

  const handleDeleteWorkspace = async (workspaceId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workspace?')) {
      const result = await deleteWorkspace(workspaceId);
      if (result.success) {
        toast.success('Workspace deleted successfully!');
        setShowMenu(null);
      } else {
        toast.error(result.error || 'Failed to delete workspace');
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
        <motion.div variants={itemVariants} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Workspaces</h1>
            <p className="text-editor-text-dim">
              Manage all your workspaces in one place
            </p>
          </div>
          <button
            onClick={handleCreateWorkspace}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus size={18} />
            <span>New Workspace</span>
          </button>
        </motion.div>

        {/* Workspaces Grid */}
        {workspaces.length > 0 ? (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <motion.div
                key={workspace._id}
                variants={itemVariants}
                onClick={() => navigate(`/workspace/${workspace._id}`)}
                className="panel hover:border-editor-accent cursor-pointer transition-all duration-200 group relative"
              >
                <div className="panel-content">
                  {/* Menu Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(showMenu === workspace._id ? null : workspace._id);
                    }}
                    className="absolute top-4 right-4 p-2 rounded hover:bg-editor-hover text-editor-text-dim hover:text-editor-text transition-colors"
                  >
                    <FiMoreVertical size={18} />
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu === workspace._id && (
                    <div className="absolute top-12 right-4 bg-editor-bg border border-editor-border rounded-lg shadow-lg z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workspace/${workspace._id}`);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-editor-hover w-full text-left"
                      >
                        <FiFolder size={16} />
                        <span>Open</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newName = prompt('Enter new name:', workspace.name);
                          if (newName) {
                            // Add update functionality if needed
                          }
                          setShowMenu(null);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-editor-hover w-full text-left"
                      >
                        <FiEdit size={16} />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteWorkspace(workspace._id, e)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-editor-hover w-full text-left text-red-400"
                      >
                        <FiTrash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  {/* Workspace Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-editor-accent rounded-lg">
                      <FiFolder className="text-white" size={24} />
                    </div>
                  </div>

                  {/* Workspace Name */}
                  <h3 className="font-semibold text-editor-text text-lg mb-2 group-hover:text-editor-accent transition-colors">
                    {workspace.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-editor-text-dim line-clamp-2 mb-4 min-h-[40px]">
                    {workspace.description || 'No description'}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-xs text-editor-text-dim">
                    <div className="flex items-center space-x-1">
                      <FiCalendar size={14} />
                      <span>
                        {new Date(workspace.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {workspace.lastAccessed && (
                      <div className="flex items-center space-x-1">
                        <FiFileText size={14} />
                        <span>
                          Last accessed: {new Date(workspace.lastAccessed).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags/Project Type */}
                  {workspace.projectType && (
                    <div className="mt-3">
                      <span className="inline-block px-2 py-1 bg-editor-hover rounded text-xs text-editor-text-dim">
                        {workspace.projectType}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="panel text-center py-16">
            <FiFolder className="mx-auto text-editor-text-dim mb-4" size={64} />
            <h3 className="text-xl font-medium text-editor-text mb-2">No workspaces yet</h3>
            <p className="text-editor-text-dim mb-6">
              Create your first workspace to get started with your projects
            </p>
            <button onClick={handleCreateWorkspace} className="btn-primary">
              <FiPlus className="inline mr-2" size={18} />
              Create Workspace
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WorkspacesPage;
