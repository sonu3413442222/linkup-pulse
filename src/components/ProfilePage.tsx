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
  Globe, LinkIcon, Mail, Trash2, UserPlus, UserMinus,
  Heart, MessageCircle, Share
} from 'lucide-react';

interface ProfilePageProps {
  user: any;
  isOwnProfile?: boolean;
}

const ProfilePage = ({ user, isOwnProfile = true }: ProfilePageProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', bio: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({
    posts: 0,
    connections: 0,
    following: 0,
    followers: 0
  });

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
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load posts');
        return;
      }

      // Add profile data to each post
      const postsWithProfile = data?.map(post => ({
        ...post,
        profiles: profile || {
          full_name: user.user_metadata?.full_name || profile?.full_name || 'Unknown User',
          email: user.email,
          bio: profile?.bio || ''
        }
      })) || [];

      setPosts(postsWithProfile);
      
      // Update stats with real data
      setStats(prev => ({
        ...prev,
        posts: data?.length || 0
      }));
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get total profiles count for connections (other users)
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('id', user.id);

      setStats({
        posts: postsCount || 0,
        connections: Math.min(profilesCount || 0, 150), // Cap at reasonable number
        following: Math.floor((profilesCount || 0) * 0.6), // 60% of connections
        followers: Math.floor((profilesCount || 0) * 0.8) // 80% of connections
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && profile !== undefined) {
      fetchUserPosts();
      fetchStats();
    }
  }, [user, profile]);

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
    setStats(prev => ({ ...prev, posts: prev.posts - 1 }));
    toast.success('Post deleted successfully!');
  };

  const handleFollow = async () => {
    try {
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed successfully!' : 'Following now!');
      // Update stats when following/unfollowing
      setStats(prev => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1
      }));
    } catch (error) {
      toast.error('Failed to update follow status');
      setIsFollowing(!isFollowing); // Revert on error
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <AnimatedCard className="bg-card backdrop-blur-sm border-border overflow-hidden">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Avatar Section */}
              <div className="relative group flex-shrink-0">
                <Avatar className="w-24 h-24 lg:w-32 lg:h-32 border-4 border-primary/50 shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-2xl lg:text-4xl">
                    {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 
                     user.email?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                {/* Pro Badge */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-accent to-primary text-accent-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  Pro
                </div>
                {/* Online indicator */}
                <div className="absolute top-1 right-1 w-5 h-5 bg-green-400 border-2 border-card rounded-full animate-pulse"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4 min-w-0">
                {!isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                        {profile?.full_name || user.email?.split('@')[0] || 'User'}
                      </h1>
                      {/* Action buttons - moved to top right on desktop */}
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0">
                        {isOwnProfile ? (
                          <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            className="transition-all duration-300 hover:scale-105 px-4 py-2 text-sm rounded-lg"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={handleFollow}
                              className={`transition-all duration-300 hover:scale-105 px-4 py-2 text-sm rounded-lg ${
                                isFollowing 
                                  ? 'bg-secondary hover:bg-secondary/80' 
                                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                              }`}
                            >
                              {isFollowing ? <UserMinus className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                              {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                            <Button
                              variant="outline"
                              className="transition-all duration-300 hover:scale-105 px-4 py-2 text-sm rounded-lg"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-muted-foreground">
                      <p className="text-lg">{profile?.bio || "Passionate professional connecting with like-minded individuals. Always excited to share insights and learn from others in this amazing community."}</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined about {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { 
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }).includes('2025') ? 'recently' : new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>Professional Network</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name" className="text-sm font-medium">Full Name</Label>
                          <Input
                            id="edit-name"
                            value={editForm.full_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-bio" className="text-sm font-medium">Bio</Label>
                          <Textarea
                            id="edit-bio"
                            value={editForm.bio}
                            onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            onClick={handleUpdateProfile}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 px-4 py-2 text-sm rounded-lg"
                          >
                            <Save className="h-4 w-4 mr-2" />
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
                            className="transition-all duration-300 rounded-lg"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
              <button className="text-center group cursor-pointer transition-all duration-300 hover:scale-105">
                <div className="text-lg lg:text-xl font-bold text-foreground">{stats.posts}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Posts</div>
              </button>
              <button className="text-center group cursor-pointer transition-all duration-300 hover:scale-105">
                <div className="text-lg lg:text-xl font-bold text-foreground">{stats.connections}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Connections</div>
              </button>
              <button className="text-center group cursor-pointer transition-all duration-300 hover:scale-105">
                <div className="text-lg lg:text-xl font-bold text-foreground">{stats.following}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Following</div>
              </button>
              <button className="text-center group cursor-pointer transition-all duration-300 hover:scale-105">
                <div className="text-lg lg:text-xl font-bold text-foreground">{stats.followers}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">Followers</div>
              </button>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Posts Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-foreground flex items-center space-x-3">
              <span>Posts ({stats.posts})</span>
            </h2>
          </div>

          {posts.length === 0 ? (
            <AnimatedCard className="bg-card backdrop-blur-sm border-border">
              <CardContent className="text-center py-16">
                <div className="space-y-6">
                  <div className="relative inline-block">
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto animate-pulse">
                      <Briefcase className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-bounce">
                      <Star className="w-4 h-4 text-accent-foreground" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground">Ready to Share Your Story?</h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      Your first post is waiting! Share your thoughts, achievements, or insights with the community.
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold px-8 py-3 text-lg hover:scale-105 transition-all duration-300">
                    Create Your First Post ✨
                  </Button>
                </div>
              </CardContent>
            </AnimatedCard>
          ) : (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PostCard 
                    post={post} 
                    currentUserId={user.email} 
                    onDelete={handlePostDeleted}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;