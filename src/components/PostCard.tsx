
import React, { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2, Bookmark, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AnimatedCard from './AnimatedCard';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      full_name: string;
      email: string;
    };
  };
  currentUserId?: string;
  onDelete?: (postId: string) => void;
}

const PostCard = ({ post, currentUserId, onDelete }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 1);
  const [showMenu, setShowMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    if (!isLiked) {
      toast.success('Post liked! ❤️');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) {
        toast.error('Failed to delete post');
        return;
      }

      toast.success('Post deleted successfully');
      onDelete?.(post.id);
    } catch (error) {
      toast.error('Failed to delete post');
    }
    setShowMenu(false);
  };

  const canDelete = currentUserId && post.profiles?.email === currentUserId;

  return (
    <div className="relative group">
      <AnimatedCard className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header with gradient overlay */}
          <div className="relative bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-pink-50/80 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-lg ring-2 ring-blue-200/50">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                      {post.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 
                       post.profiles?.email?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors duration-300 cursor-pointer text-lg">
                    {post.profiles?.full_name || 'Anonymous User'}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </p>
                </div>
              </div>

              {canDelete && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-full transition-all duration-300"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-10 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 py-2 z-20 animate-scale-in">
                      <button
                        onClick={handleDelete}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 w-full text-left transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Post</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Post content */}
            <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">{post.content}</p>
            </div>

            {/* Engagement stats */}
            <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </span>
              <div className="flex space-x-4">
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  {Math.floor(Math.random() * 10) + 1} comments
                </span>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  {Math.floor(Math.random() * 5) + 1} shares
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                    isLiked 
                      ? 'text-red-500 bg-red-50/80 hover:bg-red-100/80' 
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50/80'
                  }`}
                >
                  <Heart className={`h-5 w-5 transition-all duration-300 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
                  <span className="font-medium">Like</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 hover:scale-110">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">Comment</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-3 rounded-xl text-gray-600 hover:text-green-600 hover:bg-green-50/80 transition-all duration-300 hover:scale-110">
                  <Share className="h-5 w-5" />
                  <span className="font-medium">Share</span>
                </button>
              </div>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isBookmarked 
                    ? 'text-yellow-600 bg-yellow-50/80 hover:bg-yellow-100/80' 
                    : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50/80'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
};

export default PostCard;
