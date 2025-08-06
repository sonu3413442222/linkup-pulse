
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PenSquare, Send, Image, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    if (!content.trim()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            content: content.trim(),
            user_id: user.id
          }
        ]);

      if (error) {
        toast.error('Failed to create post');
        return;
      }

      setContent('');
      setIsExpanded(false);
      toast.success('Post created successfully!');
      onPostCreated?.();
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <Avatar className="h-12 w-12 border-2 border-white shadow-md">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder={isExpanded ? "What's happening in your professional world?" : "Share an update..."}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setIsExpanded(true)}
                  className={`resize-none transition-all duration-300 ${
                    isExpanded ? 'min-h-[120px]' : 'min-h-[50px]'
                  } border-none bg-gray-50 focus:bg-white focus:shadow-md`}
                  rows={isExpanded ? 4 : 2}
                />
              </div>

              {isExpanded && (
                <div className="flex items-center justify-between animate-fade-in">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
                    >
                      <Image className="h-5 w-5" />
                      <span className="text-sm">Photo</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors duration-200 p-2 rounded-lg hover:bg-green-50"
                    >
                      <Video className="h-5 w-5" />
                      <span className="text-sm">Video</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsExpanded(false);
                        setContent('');
                      }}
                      className="text-gray-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!content.trim() || isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                    >
                      {isLoading ? (
                        'Posting...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
