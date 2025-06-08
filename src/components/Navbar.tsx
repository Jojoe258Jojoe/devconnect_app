import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Code2, GitBranch, Zap, Users, BarChart3, Menu, X, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, profile, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  if (location.pathname === '/') {
    return null; // Hide navbar on landing page
  }

  const navigationItems = [
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/flowchart', icon: GitBranch, label: 'Flowcharts' },
    { to: '/code-generator', icon: Zap, label: 'Code Generator' },
    { to: '/communities', icon: Users, label: 'Communities' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-card-gradient backdrop-blur-xl border-b border-primary-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Code2 className="h-8 w-8 text-primary-400" />
              <div className="absolute -inset-1 bg-primary-400/20 rounded-full blur animate-glow"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              DevCollab
            </span>
          </Link>

          {/* Dropdown Menu Button */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-2 text-gray-300 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={closeDropdown}
                  />
                  
                  {/* Dropdown Content */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-card-gradient backdrop-blur-xl rounded-xl border border-primary-500/20 shadow-2xl z-50"
                  >
                    <div className="p-2">
                      {/* Navigation Items */}
                      <div className="space-y-1">
                        {navigationItems.map((item) => {
                          const isActive = location.pathname === item.to;
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={closeDropdown}
                              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                isActive 
                                  ? 'bg-primary-500/20 text-primary-400 shadow-lg shadow-primary-500/20' 
                                  : 'text-gray-300 hover:text-primary-400 hover:bg-primary-500/10'
                              }`}
                            >
                              <item.icon className="h-5 w-5" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Divider */}
                      <div className="my-2 border-t border-primary-500/20"></div>

                      {/* User Section */}
                      {isAuthenticated ? (
                        <div className="space-y-1">
                          {/* Profile Link */}
                          <Link 
                            to="/profile"
                            onClick={closeDropdown}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary-500/10 transition-colors"
                          >
                            {profile?.avatar_url ? (
                              <img 
                                src={profile.avatar_url} 
                                alt={profile.full_name}
                                className="w-6 h-6 rounded-full border-2 border-primary-400/50"
                              />
                            ) : (
                              <User className="h-5 w-5 text-primary-400" />
                            )}
                            <div className="flex-1">
                              <div className="text-white font-medium">{profile?.full_name || profile?.username}</div>
                              <div className="text-gray-400 text-sm">View Profile</div>
                            </div>
                          </Link>
                          
                          {/* Logout Button */}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Sign Out</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {/* Sign In Button */}
                          <Link
                            to="/auth"
                            onClick={closeDropdown}
                            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                          >
                            <User className="h-4 w-4" />
                            <span>Sign In</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;