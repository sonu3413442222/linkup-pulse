
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PenSquare, Send, Image, Video, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AnimatedCard from './AnimatedCard';

interface CreatePostProps {
  user: any;
  onPostCreated?: () => void;
}

const CreatePost = ({ user, onPostCreated }: CreatePostProps) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please write something before posting!');
      return;
    }

    if (!user?.id) {
      toast.error('Please log in to create posts');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            content: content.trim(),
            user_id: user.id
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to create post: ' + error.message);
        return;
      }

      console.log('Post created successfully:', data);
      setContent('');
      setIsExpanded(false);
      toast.success('🎉 Post created successfully!');
      onPostCreated?.();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <AnimatedCard className="mb-8 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 p-6">
            <div className="flex space-x-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-3 border-white/50 shadow-xl ring-2 ring-blue-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
              </div>

              <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group">
                    <Textarea
                      placeholder={isExpanded ? "Share your thoughts, insights, or updates with the community..." : "What's inspiring you today?"}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onFocus={() => setIsExpanded(true)}
                      className={cn(
                        "resize-none transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm rounded-xl",
                        "focus:bg-white focus:shadow-xl focus:ring-2 focus:ring-blue-500/50",
                        "placeholder:text-gray-500 text-gray-800",
                        isExpanded ? 'min-h-[140px]' : 'min-h-[60px]'
                      )}
                      rows={isExpanded ? 5 : 2}
                    />
                    {!isExpanded && (
                      <div className="absolute right-3 top-3 opacity-50 group-hover:opacity-100 transition-opacity">
                        <PenSquare className="h-5 w-5 text-blue-500" />
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="animate-fade-in space-y-4">
                      <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center space-x-6">
                          <button
                            type="button"
                            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-300 p-2 rounded-lg hover:bg-blue-50/80 hover:scale-105 group"
                          >
                            <Image className="h-5 w-5 group-hover:animate-bounce" />
                            <span className="text-sm font-medium">Photo</span>
                          </button>
                          <button
                            type="button"
                            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-all duration-300 p-2 rounded-lg hover:bg-green-50/80 hover:scale-105 group"
                          >
                            <Video className="h-5 w-5 group-hover:animate-bounce" />
                            <span className="text-sm font-medium">Video</span>
                          </button>
                          <button
                            type="button"
                            className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-all duration-300 p-2 rounded-lg hover:bg-purple-50/80 hover:scale-105 group"
                          >
                            <Sparkles className="h-5 w-5 group-hover:animate-spin" />
                            <span className="text-sm font-medium">Poll</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setIsExpanded(false);
                              setContent('');
                            }}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 transition-all duration-300"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={!content.trim() || isLoading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:opacity-50 text-white font-semibold px-6"
                          >
                            {isLoading ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <span>Posting...</span>
                              </div>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                                Share Post
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
};

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export default CreatePost;
