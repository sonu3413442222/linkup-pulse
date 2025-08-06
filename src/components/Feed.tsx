
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import AnimatedCard from './AnimatedCard';
import { toast } from 'sonner';
import { Loader2, PenSquare, TrendingUp, Users, Activity } from 'lucide-react';

interface FeedProps {
  user: any;
}

const Feed = ({ user }: FeedProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
        return;
      }

      console.log('Posts fetched:', data);
      setPosts(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDelay: '0.5s' }}></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-700">Loading your feed...</h3>
              <p className="text-gray-500">Gathering the latest updates and conversations</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Enhanced header */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold gradient-text mb-3 flex items-center justify-center space-x-3">
          <Activity className="w-10 h-10 text-blue-600" />
          <span>Community Feed</span>
        </h1>
        <p className="text-gray-600 text-lg">Discover insights, share thoughts, and connect with amazing people</p>
        
        {/* Feed stats */}
        <div className="flex items-center justify-center space-x-8 mt-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="font-medium">{posts.length} Active Posts</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Growing Community</span>
          </div>
        </div>
      </div>

      <CreatePost user={user} onPostCreated={fetchPosts} />
      
      <div className="space-y-8">
        {posts.length === 0 ? (
          <AnimatedCard>
            <div className="text-center py-16">
              <div className="space-y-6">
                <div className="relative inline-block">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto animate-pulse">
                    <PenSquare className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold text-gray-800">Start the Conversation!</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Be the first to share something amazing with the community. Your voice matters!
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        ) : (
          posts.map((post, index) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
