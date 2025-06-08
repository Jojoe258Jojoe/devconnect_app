import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  Crown,
  UserPlus,
  Mail,
  X,
  Image,
  Globe,
  Lock,
  Eye,
  MessageCircle,
  Star,
  TrendingUp,
  Award,
  Heart
} from 'lucide-react';
import { DatabaseService, type Community, type CommunityMember, type Profile } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface CommunityFormData {
  name: string;
  bio: string;
  description: string;
  cover_image: string;
  is_public: boolean;
  invite_emails: string;
}

const Communities = () => {
  const { user } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [communityMembers, setCommunityMembers] = useState<(CommunityMember & { profile: Profile })[]>([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CommunityFormData>();

  useEffect(() => {
    fetchCommunities();
    if (user) {
      fetchMyCommunities();
    }
  }, [user]);

  const fetchCommunities = async () => {
    try {
      const data = await DatabaseService.getCommunities(50);
      setCommunities(data);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCommunities = async () => {
    if (!user) return;
    
    try {
      const data = await DatabaseService.getMyCommunities(user.id);
      setMyCommunities(data);
    } catch (error) {
      console.error('Error fetching my communities:', error);
    }
  };

  const fetchCommunityMembers = async (communityId: string) => {
    try {
      const members = await DatabaseService.getCommunityMembers(communityId);
      setCommunityMembers(members);
    } catch (error) {
      console.error('Error fetching community members:', error);
    }
  };

  const onSubmit = async (data: CommunityFormData) => {
    if (!user) {
      toast.error('Please sign in to create a community');
      return;
    }

    try {
      const community = await DatabaseService.createCommunity({
        name: data.name,
        bio: data.bio,
        description: data.description,
        cover_image: data.cover_image || undefined,
        creator_id: user.id,
        is_public: data.is_public
      });

      // Handle email invitations (placeholder - would need backend email service)
      if (data.invite_emails.trim()) {
        const emails = data.invite_emails.split(',').map(email => email.trim()).filter(Boolean);
        console.log('Would send invitations to:', emails);
        toast.success(`Community created! Invitations would be sent to ${emails.length} email(s)`);
      } else {
        toast.success('Community created successfully!');
      }

      setShowCreateForm(false);
      reset();
      fetchCommunities();
      fetchMyCommunities();
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Failed to create community');
    }
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) {
      toast.error('Please sign in to join communities');
      return;
    }

    try {
      await DatabaseService.addCommunityMember(communityId, user.id);
      toast.success('Successfully joined the community!');
      fetchCommunities();
      fetchMyCommunities();
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('Failed to join community');
    }
  };

  const leaveCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      await DatabaseService.leaveCommunity(communityId, user.id);
      toast.success('Left the community');
      fetchCommunities();
      fetchMyCommunities();
    } catch (error) {
      console.error('Error leaving community:', error);
      toast.error('Failed to leave community');
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserMember = (communityId: string) => {
    return myCommunities.some(community => community.id === communityId);
  };

  const CommunityCard = ({ community }: { community: Community }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-card-gradient backdrop-blur-xl rounded-xl border border-primary-500/20 overflow-hidden hover:border-primary-400/40 transition-all duration-300 cursor-pointer"
      onClick={() => {
        setSelectedCommunity(community);
        fetchCommunityMembers(community.id);
      }}
    >
      <div className="relative h-32 bg-gradient-to-r from-primary-400 to-accent-400">
        {community.cover_image ? (
          <img 
            src={community.cover_image} 
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="h-12 w-12 text-white/80" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          {community.is_public ? (
            <div className="bg-green-500/20 backdrop-blur-sm rounded-full p-1">
              <Globe className="h-4 w-4 text-green-400" />
            </div>
          ) : (
            <div className="bg-red-500/20 backdrop-blur-sm rounded-full p-1">
              <Lock className="h-4 w-4 text-red-400" />
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
            {community.name}
          </h3>
          <div className="flex items-center space-x-1 text-gray-400">
            <Users className="h-4 w-4" />
            <span className="text-sm">{community.member_count || 0}</span>
          </div>
        </div>

        {community.bio && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{community.bio}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-500 text-xs">
            <Calendar className="h-3 w-3" />
            <span>{new Date(community.created_at!).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center space-x-2">
            {isUserMember(community.id) ? (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                Member
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  joinCommunity(community.id);
                }}
                className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-medium hover:bg-primary-500/30 transition-colors"
              >
                Join
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const CommunityModal = ({ community, onClose }: { community: Community; onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card-gradient backdrop-blur-xl rounded-2xl border border-primary-500/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-r from-primary-400 to-accent-400">
          {community.cover_image ? (
            <img 
              src={community.cover_image} 
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="h-16 w-16 text-white/80" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/40 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{community.name}</h2>
              {community.bio && (
                <p className="text-gray-400 text-lg">{community.bio}</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{community.member_count || 0}</div>
                <div className="text-gray-400 text-sm">Members</div>
              </div>
              {isUserMember(community.id) ? (
                <button
                  onClick={() => leaveCommunity(community.id)}
                  className="bg-red-500/20 text-red-400 px-6 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Leave Community
                </button>
              ) : (
                <button
                  onClick={() => joinCommunity(community.id)}
                  className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                >
                  Join Community
                </button>
              )}
            </div>
          </div>

          {community.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">About</h3>
              <p className="text-gray-300 leading-relaxed">{community.description}</p>
            </div>
          )}

          {/* Members Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Members ({communityMembers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityMembers.slice(0, 9).map((member) => (
                <div key={member.id} className="bg-dark-800/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    {member.profile?.avatar_url ? (
                      <img
                        src={member.profile.avatar_url}
                        alt={member.profile.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{member.profile?.full_name}</span>
                        {member.role === 'admin' && (
                          <Crown className="h-4 w-4 text-accent-400" />
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">@{member.profile?.username}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {communityMembers.length > 9 && (
              <div className="mt-4 text-center">
                <button className="text-primary-400 hover:text-primary-300 text-sm">
                  View all {communityMembers.length} members
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-400 to-accent-400 rounded-2xl mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Developer Communities</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Connect with like-minded developers, share knowledge, and collaborate on exciting projects.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Communities', value: communities.length.toString(), icon: Users, color: 'from-blue-400 to-blue-600' },
            { label: 'My Communities', value: myCommunities.length.toString(), icon: Heart, color: 'from-primary-400 to-primary-600' },
            { label: 'Active Members', value: '12.5k', icon: TrendingUp, color: 'from-purple-400 to-purple-600' },
            { label: 'Top Rated', value: '4.8', icon: Star, color: 'from-accent-400 to-accent-600' }
          ].map((stat, index) => (
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

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="flex bg-dark-800/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All Communities
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'my'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                My Communities
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-dark-800/50 border border-primary-500/30 rounded-lg text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Community</span>
          </button>
        </motion.div>

        {/* Communities Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card-gradient backdrop-blur-xl rounded-xl border border-primary-500/20 overflow-hidden animate-pulse">
                  <div className="h-32 bg-dark-800/50"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-dark-800/50 rounded"></div>
                    <div className="h-4 bg-dark-800/50 rounded w-3/4"></div>
                    <div className="h-4 bg-dark-800/50 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'all' ? filteredCommunities : myCommunities).map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          )}

          {!loading && (activeTab === 'all' ? filteredCommunities : myCommunities).length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {activeTab === 'all' ? 'No communities found' : 'No communities joined yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {activeTab === 'all' 
                  ? 'Try adjusting your search terms or create a new community.'
                  : 'Join some communities to see them here.'
                }
              </p>
              {activeTab === 'my' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                >
                  Explore Communities
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Create Community Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card-gradient backdrop-blur-xl rounded-2xl border border-primary-500/20 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Create New Community</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Community Name *
                    </label>
                    <input
                      {...register('name', { required: 'Community name is required' })}
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="Enter community name"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Short Bio
                    </label>
                    <input
                      {...register('bio')}
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="Brief description of your community"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all resize-none"
                      placeholder="Detailed description of your community's purpose and goals"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cover Image URL
                    </label>
                    <input
                      {...register('cover_image')}
                      type="url"
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        {...register('is_public')}
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-500 bg-dark-800 border-primary-500/30 rounded focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="text-gray-300">Make community public</span>
                    </label>
                    <p className="text-gray-500 text-sm mt-1">
                      Public communities can be discovered and joined by anyone
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Invite Members (Email addresses, comma separated)
                    </label>
                    <textarea
                      {...register('invite_emails')}
                      rows={3}
                      className="w-full bg-dark-800/50 border border-primary-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all resize-none"
                      placeholder="user1@example.com, user2@example.com"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Optional: Invite people to join your community via email
                    </p>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                    >
                      Create Community
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Community Detail Modal */}
        <AnimatePresence>
          {selectedCommunity && (
            <CommunityModal 
              community={selectedCommunity} 
              onClose={() => setSelectedCommunity(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Communities;