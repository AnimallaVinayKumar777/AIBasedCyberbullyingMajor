import { useState } from 'react';
import { X, Image as ImageIcon, Smile, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ComposerProps {
  open: boolean;
  onClose: () => void;
}

export const Composer = ({ open, onClose }: ComposerProps) => {
  const [content, setContent] = useState('');
  const { addPost } = useApp();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const maxLength = 280;

  const handlePost = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to post content.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (content.trim() && content.length <= maxLength) {
      try {
        console.log('📝 Calling addPost with content:', content);
        await addPost(content);
        console.log('✅ addPost completed successfully');
        toast({
          title: "Post created!",
          description: "Your chirp has been posted successfully.",
        });
        setContent('');
        onClose();
      } catch (error) {
        console.error('❌ Error in handlePost:', error);
        toast({
          title: "Error posting",
          description: "There was an error posting your content. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              onClick={handlePost}
              disabled={!content.trim() || content.length > maxLength}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              Post
            </Button>
          </div>

          <div className="p-4 flex gap-3">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{user?.name?.[0] || '?'}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] border-0 focus-visible:ring-0 resize-none text-lg p-0 placeholder:text-muted-foreground"
                autoFocus
              />

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-primary">
                    <MapPin className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <AnimatePresence>
                    {content.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="relative w-8 h-8"
                      >
                        <svg className="w-8 h-8 -rotate-90">
                          <circle
                            cx="16"
                            cy="16"
                            r="14"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="14"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 14}`}
                            strokeDashoffset={`${
                              2 * Math.PI * 14 * (1 - content.length / maxLength)
                            }`}
                            className={`transition-all ${
                              content.length > maxLength
                                ? 'text-destructive'
                                : 'text-primary'
                            }`}
                          />
                        </svg>
                        {content.length >= maxLength - 20 && (
                          <span
                            className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${
                              content.length > maxLength
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {maxLength - content.length}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
