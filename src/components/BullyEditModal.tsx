import { useState } from 'react';
import { AlertTriangle, Clock, Edit3, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModeratedPost } from '@/utils/postModeration';
import { useEditTimer, formatEditTimeRemaining } from '@/hooks/useEditTimer';
import { EditModal } from '@/components/EditModal';

interface BullyEditModalProps {
  post: ModeratedPost;
  open: boolean;
  onClose: () => void;
}

export const BullyEditModal = ({ post, open, onClose }: BullyEditModalProps) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { timeRemaining, isActive, isExpired, hasEditChance } = useEditTimer(post);

  const handleEditClick = () => {
    if (isActive && hasEditChance) {
      setEditModalOpen(true);
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    onClose(); // Close the BullyEditModal after successful edit
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Content Policy Violation
            </DialogTitle>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                Your post has been detected as containing potentially harmful content.
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                You have one opportunity to edit this post before it gets flagged for moderation.
              </p>
            </div>

            {isActive && hasEditChance && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Time Remaining to Edit
                  </span>
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    {formatEditTimeRemaining(timeRemaining)}
                  </span>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <AlertTriangle className="w-5 h-5 text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Edit Time Expired
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    This post has been flagged for moderation. An email warning has been sent to your account.
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {isActive && hasEditChance && (
                <Button
                  onClick={handleEditClick}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Post
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                {isExpired ? 'Close' : 'Cancel'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {isExpired
                ? 'Repeated violations may result in account suspension.'
                : 'Edit your post to remove harmful content and avoid moderation.'
              }
            </p>
          </motion.div>
        </DialogContent>
      </Dialog>

      <EditModal
        post={post}
        open={editModalOpen}
        onClose={handleEditModalClose}
        onEditSuccess={handleEditSuccess}
      />
    </>
  );
};