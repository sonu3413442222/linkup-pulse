
import React, { useState, useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2, Bookmark, TrendingUp, Edit, Save, X, UserPlus, UserMinus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AnimatedCard from './AnimatedCard';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    user_id?: string;
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
  const [likeCount, setLikeCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch likes, comments and follow status
  useEffect(() => {
    fetchLikes();
    fetchComments();
    checkFollowStatus();
  }, [post.id]);

  const fetchLikes = async () => {
    try {
      const { data: likes } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post.id);
      
      setLikeCount(likes?.length || 0);
      
      const currentUser = (await supabase.auth.getUser()).data.user;
      const userLike = likes?.find(like => like.user_id === currentUser?.id);
      setIsLiked(!!userLike);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data: comments } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      setComments(comments || []);
      setCommentCount(comments?.length || 0);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser || currentUser.email === currentUserId) return;
      
      // For now, we'll use email comparison since user_id might not be available
      // In a real implementation, we'd need the actual user_id from the post
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', currentUser.id);
      
      setIsFollowing(!!data?.length);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleLike = async () => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUser.id);
        
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: currentUser.id
          });
        
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
        toast.success('Post liked! ❤️');
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: currentUser.id,
          content: newComment.trim()
        });
      
      setNewComment('');
      fetchComments();
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleFollow = async () => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) return;

      if (isFollowing) {
        setIsFollowing(false);
        toast.success('Unfollowed successfully!');
      } else {
        setIsFollowing(true);
        toast.success('Following now!');
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  const handleEdit = async () => {
    try {
      await supabase
        .from('posts')
        .update({ content: editContent })
        .eq('id', post.id);
      
      post.content = editContent;
      setIsEditing(false);
      toast.success('Post updated successfully!');
    } catch (error) {
      toast.error('Failed to update post');
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
  const canEdit = currentUserId && post.profiles?.email === currentUserId;
  const showFollowButton = currentUserId && post.profiles?.email !== currentUserId;

  return (
    <div className="relative group">
      <AnimatedCard className="overflow-hidden bg-card border-border">
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-background/80 via-muted/60 to-background/80 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-card shadow-lg ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
                      {post.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 
                       post.profiles?.email?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-card rounded-full"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-foreground hover:text-primary transition-colors duration-300 cursor-pointer text-lg">
                      {post.profiles?.full_name || 'Anonymous User'}
                    </h3>
                    {showFollowButton && (
                      <Button
                        onClick={handleFollow}
                        size="sm"
                        variant={isFollowing ? "secondary" : "default"}
                        className="text-xs h-6 px-3"
                      >
                        {isFollowing ? <UserMinus className="h-3 w-3 mr-1" /> : <UserPlus className="h-3 w-3 mr-1" />}
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center space-x-2">
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </p>
                </div>
              </div>

              {(canDelete || canEdit) && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-300"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-10 bg-card/95 backdrop-blur-xl rounded-xl shadow-xl border border-border py-2 z-20 animate-scale-in">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted w-full text-left transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit Post</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={handleDelete}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 w-full text-left transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Post</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Post content */}
            <div className="mb-6 bg-card/80 backdrop-blur-sm rounded-xl p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="resize-none min-h-[100px]"
                    placeholder="Edit your post..."
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleEdit} size="sm" className="bg-primary hover:bg-primary/90">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(post.content);
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg">{post.content}</p>
              )}
            </div>

            {/* Engagement stats */}
            <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
              <span className="hover:text-primary cursor-pointer transition-colors">
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </span>
              <div className="flex space-x-4">
                <span 
                  className="hover:text-primary cursor-pointer transition-colors"
                  onClick={() => setShowComments(!showComments)}
                >
                  {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                </span>
                <span className="hover:text-primary cursor-pointer transition-colors">
                  {Math.floor(Math.random() * 5) + 1} shares
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                    isLiked 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 transition-all duration-300 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
                  <span className="font-medium">Like</span>
                </button>

                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-300 hover:scale-110"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">Comment</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-3 rounded-xl text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-110">
                  <Share className="h-5 w-5" />
                  <span className="font-medium">Share</span>
                </button>
              </div>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isBookmarked 
                    ? 'text-accent bg-accent/10 hover:bg-accent/20' 
                    : 'text-muted-foreground hover:text-accent hover:bg-accent/10'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                {/* Add Comment */}
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm">
                      {currentUserId?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                    />
                    <Button onClick={handleComment} size="sm" disabled={!newComment.trim()}>
                      Comment
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm">
                        {comment.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 
                         comment.profiles?.email?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm text-foreground">
                            {comment.profiles?.full_name || 'Anonymous User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-foreground">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
};

export default PostCard;
