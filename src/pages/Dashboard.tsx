import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GitBranch, 
  Zap, 
  Users, 
  Code2, 
  TrendingUp, 
  Award, 
  Clock, 
  Star,
  ArrowRight,
  BarChart3,
  Activity,
  Calendar,
  User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {isAuthenticated ? (
            <>
              <h1 className="text-5xl font-bold text-white mb-4">
                Welcome back, <span className="text-primary-400">{user?.name || 'Developer'}</span>!
              </h1>
              <p className="text-xl text-gray-300">Here's your impact in the developer community</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-400 to-accent-400 rounded-2xl mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Developer <span className="text-primary-400">Dashboard</span>
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Explore the power of collaborative development
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all"
              >
                <span>Sign In to Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            { 
              label: isAuthenticated ? 'Articles Written' : 'Total Articles', 
              value: isAuthenticated ? '12' : '2.5k', 
              color: 'from-blue-400 to-blue-600',
              icon: Code2
            },
            { 
              label: isAuthenticated ? 'Ideas Submitted' : 'Project Ideas', 
              value: isAuthenticated ? '8' : '1.2k', 
              color: 'from-green-400 to-green-600',
              icon: TrendingUp
            },
            { 
              label: isAuthenticated ? 'Collaborations' : 'Active Collaborations', 
              value: isAuthenticated ? '34' : '890', 
              color: 'from-purple-400 to-purple-600',
              icon: Users
            },
            { 
              label: isAuthenticated ? 'User Rating' : 'Community Rating', 
              value: '4.8', 
              color: 'from-yellow-400 to-yellow-600',
              icon: Star
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-card-gradient backdrop-blur-xl rounded-xl p-6 border border-primary-500/20 hover:border-primary-400/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} p-3`}>
                  <stat.icon className="w-full h-full text-white" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card-gradient backdrop-blur-xl rounded-2xl border border-primary-500/20 p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Activity className="h-6 w-6 mr-3 text-primary-400" />
              {isAuthenticated ? 'Recent Activity' : 'Platform Activity'}
            </h2>
            {!isAuthenticated && (
              <Link
                to="/auth"
                className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
              >
                Sign in to see your activity →
              </Link>
            )}
          </div>
          
          <div className="space-y-4">
            {[
              { 
                type: 'article', 
                title: isAuthenticated ? 'Published: React Performance Tips' : 'New Article: Advanced React Patterns', 
                time: '2 hours ago',
                icon: Code2,
                color: 'from-blue-400 to-blue-600'
              },
              { 
                type: 'collaboration', 
                title: isAuthenticated ? 'Joined: E-commerce Platform' : 'New Collaboration: AI-Powered Analytics', 
                time: '1 day ago',
                icon: Users,
                color: 'from-green-400 to-green-600'
              },
              { 
                type: 'idea', 
                title: isAuthenticated ? 'Shared: AI Code Assistant' : 'Trending Idea: Blockchain Voting System', 
                time: '2 days ago',
                icon: TrendingUp,
                color: 'from-purple-400 to-purple-600'
              },
              { 
                type: 'code', 
                title: isAuthenticated ? 'Generated: REST API Template' : 'Popular Code: GraphQL Schema Generator', 
                time: '3 days ago',
                icon: Zap,
                color: 'from-yellow-400 to-yellow-600'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-dark-800/30 rounded-lg hover:bg-dark-800/50 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${activity.color} p-2`}>
                  <activity.icon className="w-full h-full text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.title}</p>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Clock className="h-3 w-3" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link 
            to={isAuthenticated ? "/flowchart" : "/auth"}
            className="group bg-card-gradient backdrop-blur-xl rounded-xl p-8 border border-primary-500/20 hover:border-primary-400/40 transition-all duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary-400 to-primary-600 p-3 group-hover:scale-110 transition-transform">
                <GitBranch className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Create Flowcharts</h3>
            </div>
            <p className="text-gray-400 mb-4">Design visual flowcharts and system architectures with our intuitive drag-and-drop editor.</p>
            <div className="flex items-center text-primary-400 font-medium">
              <span>Start Creating</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link 
            to={isAuthenticated ? "/code-generator" : "/auth"}
            className="group bg-card-gradient backdrop-blur-xl rounded-xl p-8 border border-primary-500/20 hover:border-primary-400/40 transition-all duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-accent-400 to-orange-500 p-3 group-hover:scale-110 transition-transform">
                <Zap className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Generate Code</h3>
            </div>
            <p className="text-gray-400 mb-4">Use AI to generate production-ready code in multiple programming languages and frameworks.</p>
            <div className="flex items-center text-accent-400 font-medium">
              <span>Generate Now</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link 
            to={isAuthenticated ? "/communities" : "/auth"}
            className="group bg-card-gradient backdrop-blur-xl rounded-xl p-8 border border-primary-500/20 hover:border-primary-400/40 transition-all duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 p-3 group-hover:scale-110 transition-transform">
                <Users className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Join Communities</h3>
            </div>
            <p className="text-gray-400 mb-4">Connect with developers worldwide, share knowledge, and collaborate on exciting projects.</p>
            <div className="flex items-center text-purple-400 font-medium">
              <span>Explore Communities</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>

        {/* Platform Stats for Non-Authenticated Users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-gradient-to-r from-primary-900/20 to-accent-900/20 rounded-2xl p-8 border border-primary-500/20"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Join Our Growing Community</h3>
              <p className="text-gray-400">Thousands of developers are already collaborating and creating amazing projects</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Active Developers', value: '12.5k', icon: User },
                { label: 'Projects Created', value: '8.2k', icon: Code2 },
                { label: 'Code Generated', value: '45k', icon: Zap },
                { label: 'Communities', value: '150+', icon: Users }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary-400 to-accent-400 p-3 mx-auto mb-3">
                    <stat.icon className="w-full h-full text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;