import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import { validatePassword, isValidEmail } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const passwordStrength = validatePassword(formData.password);
    if (passwordStrength.score < 3) {
      toast.error('Password is too weak. Please include uppercase, lowercase, numbers, and special characters');
      return;
    }

    setIsLoading(true);
    
    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      toast.success('Registration successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
    
    setIsLoading(false);
  };

  const passwordStrength = validatePassword(formData.password);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="panel">
          <div className="panel-header">
            <h1 className="text-2xl font-bold text-gradient">Create Account</h1>
            <p className="text-editor-text-dim mt-2">Join the AI coding revolution</p>
          </div>
          
          <div className="panel-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-editor-text mb-2">
                  Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field pl-10 w-full"
                    placeholder="Enter your name"
                    autoComplete="name"
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10 w-full"
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-editor-text mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10 w-full"
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim hover:text-editor-text"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-editor-border rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 2 ? 'bg-red-500' :
                            passwordStrength.score <= 3 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-editor-text-dim">
                        {passwordStrength.score <= 2 ? 'Weak' :
                         passwordStrength.score <= 3 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center ${passwordStrength.minLength ? 'text-green-400' : 'text-editor-text-dim'}`}>
                        {passwordStrength.minLength ? <FiCheck className="mr-1" /> : <FiX className="mr-1" />}
                        6+ characters
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-400' : 'text-editor-text-dim'}`}>
                        {passwordStrength.hasUpperCase ? <FiCheck className="mr-1" /> : <FiX className="mr-1" />}
                        Uppercase
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-400' : 'text-editor-text-dim'}`}>
                        {passwordStrength.hasLowerCase ? <FiCheck className="mr-1" /> : <FiX className="mr-1" />}
                        Lowercase
                      </div>
                      <div className={`flex items-center ${passwordStrength.hasNumbers ? 'text-green-400' : 'text-editor-text-dim'}`}>
                        {passwordStrength.hasNumbers ? <FiCheck className="mr-1" /> : <FiX className="mr-1" />}
                        Numbers
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-editor-text mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10 w-full"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-editor-text-dim hover:text-editor-text"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-editor-border bg-editor-sidebar text-editor-accent focus:ring-editor-accent"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-editor-text-dim">
                  I agree to the{' '}
                  <a href="#" className="text-editor-accent hover:text-blue-400">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-editor-accent hover:text-blue-400">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-editor-text-dim">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-editor-accent hover:text-blue-400">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
  );
};

export default RegisterPage;
