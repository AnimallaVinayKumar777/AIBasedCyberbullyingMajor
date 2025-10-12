import { useState } from 'react';
import { X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModeratedPost } from '@/utils/postModeration';
import { useApp } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';

interface CommentDialogProps {
  post: ModeratedPost;
  open: boolean;
  onClose: () => void;
}

export const CommentDialog = ({ post, open, onClose }: CommentDialogProps) => {
  const { addComment, currentUser } = useApp();
  const [commentText, setCommentText] = useState('');

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    
    addComment(post.id, commentText);
    setCommentText('');
    toast({
      title: "Comment added!",
      description: "Your comment has been posted.",
    });
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-6 pb-6 border-b border-border">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-semibold text-foreground">{post.author.name}</span>
                  <span className="text-muted-foreground text-sm">{post.author.handle}</span>
                </div>
                <p className="text-foreground mb-2">{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="rounded-xl w-full max-h-96 object-cover mb-2"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {post.commentList && post.commentList.length > 0 ? (
                post.commentList.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-3"
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-semibold text-foreground">{comment.author.name}</span>
                        <span className="text-muted-foreground text-sm">{comment.author.handle}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">{formatTimestamp(comment.timestamp)}</span>
                      </div>
                      <p className="text-foreground">{comment.content}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="border-t border-border px-4 py-3">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Write your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!commentText.trim()}
                  size="sm"
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
