import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  MapPin, 
  Github, 
  Linkedin, 
  Edit3, 
  Save, 
  X,
  Camera,
  Award,
  Code2,
  GitBranch,
  Users
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  location: string;
  github: string;
  linkedin: string;
  skills: string;
}

const Profile = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      github: user?.github || '',
      linkedin: user?.linkedin || '',
      skills: user?.skills?.join(', ') || '',
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    const skills = data.skills.split(',').map(skill => skill.trim()).filter(Boolean);
    updateProfile({
      ...data,
      skills
    });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const stats = [
    { label: 'Ideas Shared', value: '127', icon: Code2, color: 'from-blue-400 to-blue-600' },
    { label: 'Collaborations', value: '34', icon: Users, color: 'from-primary-400 to-primary-600' },
    { label: 'Flowcharts', value: '23', icon: GitBranch, color: 'from-purple-400 to-purple-600' },
    { label: 'Reputation', value: '2.4k', icon: Award, color: 'from-accent-400 to-accent-600' }
  ];

  const recentActivity = [
    { type: 'idea', title: 'Shared: React Performance Optimization', time: '2 hours ago' },
    { type: 'collaboration', title: 'Joined: E-commerce Platform Project', time: '1 day ago' },
    { type: 'flowchart', title: 'Created: User Authentication Flow', time: '2 days ago' },
    { type: 'code', title: 'Generated: REST API Boilerplate', time: '3 days ago' }
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-gradient backdrop-blur-xl rounded-2xl border border-primary-500/20 p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-400/50">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-primary-400 to-accent-400 flex items-center justify-center">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
                  <p className="text-gray-400 mb-4">{user?.bio}</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 bg-primary-500/20 text-primary-400 px-4 py-2 rounded-lg hover:bg-primary-500/30 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-4 text-gray-400">
                {user?.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                {user?.github && (
                  <div className="flex items-center space-x-2">
                    <Github className="h-4 w-4" />
                    <span>{user.github}</span>
                  </div>
                )}
                {user?.linkedin && (
                  <div className="flex items-center space-x-2">
                    <Linkedin className="h-4 w-4" />
                    <span>{user.linkedin}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {user?.skills && user.skills.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card-gradient backdrop-blur-xl rounded-2xl border border-primary-500/20 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      {...register('email', { required: 'Email is required' })}
                      type="email"
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    rows={3}
                    className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      {...register('location')}
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Skills (comma separated)
                    </label>
                    <input
                      {...register('skills')}
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="React, TypeScript, Node.js"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GitHub Username
                    </label>
                    <input
                      {...register('github')}
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="github-username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      LinkedIn Profile
                    </label>
                    <input
                      {...register('linkedin')}
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="linkedin-profile"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-card-gradient backdrop-blur-xl rounded-xl p-6 border border-primary-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} p-3`}>
                  <stat.icon className="w-full h-full text-white" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card-gradient backdrop-blur-xl rounded-xl border border-primary-500/20 overflow-hidden"
        >
          <div className="flex border-b border-primary-500/20">
            {['overview', 'activity', 'projects'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {user?.bio || 'No bio available. Click "Edit Profile" to add one.'}
                  </p>
                </div>
                
                {user?.skills && user.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Skills & Technologies</h3>
                    <div className="flex flex-wrap gap-3">
                      {user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-dark-800/30 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                      activity.type === 'idea' ? 'from-blue-400 to-blue-600' :
                      activity.type === 'collaboration' ? 'from-primary-400 to-primary-600' :
                      activity.type === 'flowchart' ? 'from-purple-400 to-purple-600' :
                      'from-accent-400 to-accent-600'
                    } p-2`}>
                      {activity.type === 'idea' && <Code2 className="w-full h-full text-white" />}
                      {activity.type === 'collaboration' && <Users className="w-full h-full text-white" />}
                      {activity.type === 'flowchart' && <GitBranch className="w-full h-full text-white" />}
                      {activity.type === 'code' && <Code2 className="w-full h-full text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.title}</p>
                      <p className="text-gray-400 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="text-center py-12">
                <Code2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                <p className="text-gray-400 mb-6">Start collaborating and your projects will appear here.</p>
                <button className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all">
                  Create First Project
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;