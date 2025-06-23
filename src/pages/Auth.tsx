import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import GoogleAuthButton from '../components/GoogleAuthButton';

type AuthMode = 'signin' | 'signup' | 'forgot';

interface FormData {
  email: string;
  password: string;
  name: string;
  username: string;
  confirmPassword: string;
}

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { login, register, resetPassword } = useAuthStore();
  
  const { register: registerField, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      let success = false;
      
      if (mode === 'signin') {
        success = await login(data.email, data.password);
        if (success) {
          setShowSuccess(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          toast.error('Invalid credentials');
        }
      } else if (mode === 'signup') {
        if (data.password !== data.confirmPassword) {
          toast.error('Passwords do not match');
          setIsLoading(false);
          return;
        }
        success = await register(data.email, data.password, data.name, data.username);
        if (success) {
          setShowSuccess(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          toast.error('Failed to create account');
        }
      } else if (mode === 'forgot') {
        success = await resetPassword(data.email);
        if (success) {
          toast.success('Password reset email sent!');
          setMode('signin');
        } else {
          toast.error('Failed to send reset email');
        }
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    reset();
    setShowSuccess(false);
  };

  const handleGoogleSuccess = () => {
    // Google auth will handle the redirect
    toast.success('Redirecting to Google...');
  };

  const handleGoogleError = (error: string) => {
    toast.error(`Google sign-in failed: ${error}`);
  };

  // Success overlay
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-main-gradient flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="h-12 w-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-white mb-2"
          >
            {mode === 'signin' ? 'Welcome Back!' : 'Account Created!'}
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-300 mb-6"
          >
            {mode === 'signin' 
              ? 'You have successfully signed in to DevCollab' 
              : 'Your account has been created successfully'
            }
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-primary-400"
          >
            Redirecting to dashboard...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-gradient flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')] bg-cover bg-center"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card-gradient backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-500/20 p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block p-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl mb-4"
            >
              <User className="h-8 w-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Join DevCollab'}
              {mode === 'forgot' && 'Reset Password'}
            </h1>
            
            <p className="text-gray-400">
              {mode === 'signin' && 'Sign in to your account'}
              {mode === 'signup' && 'Create your developer account'}
              {mode === 'forgot' && 'Enter your email to reset password'}
            </p>
          </div>

          {/* Google Auth Button */}
          {mode !== 'forgot' && (
            <div className="mb-6">
              <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                redirectTo="/dashboard"
              />
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-800 text-gray-400">Or continue with email</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...registerField('name', { required: mode === 'signup' ? 'Name is required' : false })}
                      type="text"
                      className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-primary-500/30 rounded-xl text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...registerField('username', { required: mode === 'signup' ? 'Username is required' : false })}
                      type="text"
                      className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-primary-500/30 rounded-xl text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="Choose a username"
                    />
                  </div>
                  {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...registerField('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-primary-500/30 rounded-xl text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...registerField('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-12 pr-12 py-3 bg-dark-800/50 border border-primary-500/30 rounded-xl text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...registerField('confirmPassword', { 
                      required: 'Please confirm your password'
                    })}
                    type="password"
                    className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-primary-500/30 rounded-xl text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-primary-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 
                mode === 'signin' ? 'Sign In' :
                mode === 'signup' ? 'Create Account' :
                'Send Reset Email'
              }
            </motion.button>
          </form>

          <div className="mt-6 text-center space-y-4">
            {mode === 'signin' && (
              <>
                <button
                  onClick={() => switchMode('forgot')}
                  className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
                >
                  Forgot your password?
                </button>
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => switchMode('signup')}
                    className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <button
                onClick={() => switchMode('signin')}
                className="flex items-center justify-center text-primary-400 hover:text-primary-300 text-sm transition-colors mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;