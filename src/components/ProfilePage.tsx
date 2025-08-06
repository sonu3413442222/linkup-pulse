import React, { useState, useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import PostCard from './PostCard';
import AnimatedCard from './AnimatedCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Edit, Save, X, MapPin, Calendar, Briefcase, Users, 
  Star, Award, TrendingUp, Activity, Camera, Settings,
  Globe, LinkIcon, Mail
} from 'lucide-react';

interface ProfilePageProps {
  user: any;
}

const ProfilePage = ({ user }: ProfilePageProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', bio: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        toast.error('Failed to load profile');
        return;
      }

      setProfile(data);
      if (data) {
        setEditForm({
          full_name: data.full_name || '',
          bio: data.bio || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            full_name,
            email,
            bio
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load posts');
        return;
      }

      setPosts(data || []);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: editForm.full_name,
          bio: editForm.bio,
          email: user.email,
          updated_at: new Date().toISOString()
        });

      if (error) {
        toast.error('Failed to update profile');
        return;
      }

      setIsEditing(false);
      toast.success('Profile updated successfully!');
      await fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDelay: '0.5s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your amazing profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Enhanced Profile Header */}
      <AnimatedCard className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
          
          {/* Camera button for cover photo */}
          <button className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110">
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>

        <CardContent className="px-8 pb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-end space-y-6 lg:space-y-0 lg:space-x-8 -mt-16">
            {/* Enhanced Avatar */}
            <div className="relative group">
              <Avatar className="w-32 h-32 border-6 border-white shadow-2xl ring-4 ring-blue-200/50 transition-all duration-300 group-hover:scale-105">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-4xl">
                  {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 
                   user.email?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110">
                <Camera className="w-4 h-4" />
              </button>
              {/* Online indicator */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-green-400 border-3 border-white rounded-full animate-pulse"></div>
            </div>

            <div className="flex-1 text-center lg:text-left space-y-4">
              {!isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center lg:justify-start space-x-3">
                    <h1 className="text-4xl font-bold text-gray-900 gradient-text">
                      {profile?.full_name || 'Add Your Name'}
                    </h1>
                    <Award className="w-6 h-6 text-yellow-500" />
                  </div>
                  
                  <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-l-4 border-blue-500">
                    <p className="text-gray-700 leading-relaxed">
                      {profile?.bio || 'Share your story! Add a bio to tell people about your journey, interests, and aspirations. ✨'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-lg font-semibold text-gray-700">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="text-lg py-3 border-2 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-bio" className="text-lg font-semibold text-gray-700">Bio</Label>
                    <Textarea
                      id="edit-bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself, your interests, goals..."
                      rows={4}
                      className="text-lg border-2 focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col space-y-3">
              {!isEditing ? (
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 px-6 py-3 text-lg font-semibold"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 hover:scale-105 px-6 py-3"
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleUpdateProfile}
                    className="bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 px-6 py-3 font-semibold"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        full_name: profile?.full_name || '',
                        bio: profile?.bio || ''
                      });
                    }}
                    variant="outline"
                    className="border-2 border-gray-300 hover:border-red-500 hover:text-red-600 transition-all duration-300"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 group-hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold">{posts.length}</div>
                <div className="text-blue-100">Posts</div>
              </div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 group-hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold">{Math.floor(Math.random() * 500) + 100}</div>
                <div className="text-green-100">Connections</div>
              </div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 group-hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold">{Math.floor(Math.random() * 200) + 50}</div>
                <div className="text-purple-100">Following</div>
              </div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-4 group-hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold">{Math.floor(Math.random() * 1000) + 200}</div>
                <div className="text-pink-100">Followers</div>
              </div>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Posts Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 gradient-text flex items-center space-x-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <span>Your Posts</span>
            <span className="text-lg text-gray-500">({posts.length})</span>
          </h2>
        </div>

        {posts.length === 0 ? (
          <AnimatedCard>
            <CardContent className="text-center py-16">
              <div className="space-y-6">
                <div className="relative inline-block">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto animate-pulse">
                    <Briefcase className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Star className="w-4 h-4 text-yellow-800" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800">Ready to Share Your Story?</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Your first post is waiting! Share your thoughts, achievements, or insights with the community.
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 text-lg hover:scale-105 transition-all duration-300">
                  Create Your First Post ✨
                </Button>
              </div>
            </CardContent>
          </AnimatedCard>
        ) : (
          <div className="space-y-8">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PostCard 
                  post={post} 
                  currentUserId={user?.email}
                  onDelete={handlePostDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
