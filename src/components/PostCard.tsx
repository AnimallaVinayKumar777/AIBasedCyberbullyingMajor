import { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share, Flag, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeratedPost } from '@/utils/postModeration';
import { useApp } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CommentDialog } from '@/components/CommentDialog';
import { postModerationService } from '@/utils/postModeration';
import { useBullyTimer, formatTimeRemaining } from '@/hooks/useBullyTimer';

interface PostCardProps {
  post: ModeratedPost;
}

export const PostCard = ({ post }: PostCardProps) => {
  const { toggleLike, toggleRepost, likedPosts, repostedPosts } = useApp();
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(!post.isHidden);
  const isLiked = likedPosts.has(post.id);
  const isReposted = repostedPosts.has(post.id);

  // Timer for bully posts
  const { timeRemaining, isActive, isExpired } = useBullyTimer(post);

  const handleLike = () => {
    toggleLike(post.id);
    if (!isLiked) {
      toast({
        title: "Liked!",
        description: "Post has been added to your likes.",
      });
    }
  };

  const handleComment = () => {
    setCommentDialogOpen(true);
  };

  const handleRepost = () => {
    toggleRepost(post.id);
    if (!isReposted) {
      toast({
        title: "Reposted!",
        description: "Post has been shared to your followers.",
      });
    } else {
      toast({
        title: "Unreposted",
        description: "Post removed from your profile.",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({
      title: "Link copied!",
      description: "Post link has been copied to clipboard.",
    });
  };

  const handleReveal = () => {
    setIsRevealed(true);
    toast({
      title: "Content revealed",
      description: "Tweet content is now visible.",
    });
  };

  const handleReport = (reason: string) => {
    postModerationService.reportPost(post.id, reason);
    toast({
      title: "Post reported",
      description: `Thank you for reporting. We'll review this ${reason}.`,
      variant: "destructive"
    });
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${Math.floor(diff / (1000 * 60))}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border p-4 hover:bg-muted/30 transition-colors cursor-pointer"
    >
      <div className="flex gap-3">
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={post.author.avatar} alt={post.author.name} />
          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-semibold text-foreground hover:underline truncate">
              {post.author.name}
            </span>
            <span className="text-muted-foreground text-sm truncate">
              {post.author.handle}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm flex-shrink-0">
              {formatTimestamp(post.timestamp)}
            </span>
          </div>

          {/* Status badges */}
          <div className="flex gap-2 mb-2">
            {post.isBully && (
              <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                Bully
              </Badge>
            )}
            {post.isReported && (
              <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">
                Reported
              </Badge>
            )}
            {post.isAutoBlurred && (
              <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white">
                Auto-Blurred
              </Badge>
            )}
            {post.isAutoDeleted && (
              <Badge variant="destructive" className="bg-gray-500 hover:bg-gray-600 text-white">
                Auto-Deleted
              </Badge>
            )}
          </div>

          {/* Bully post countdown timer */}
          {post.isBully && isActive && !post.isAutoBlurred && !post.isAutoDeleted && (
            <div className="flex items-center gap-2 mb-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <Clock className="w-5 h-5 text-red-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  ⚠️ Content Violation Detected
                </span>
                <span className="text-sm text-red-500 dark:text-red-400">
                  Auto-blur in: <span className="font-bold">{formatTimeRemaining(timeRemaining)}</span> (2 seconds)
                </span>
              </div>
            </div>
          )}

          {/* Auto-deleted content */}
          {post.isAutoDeleted ? (
            <div className="relative mb-3">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-300 dark:border-gray-600">
                <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  This post has been automatically deleted due to severe policy violations.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Content removed after 2-second timer expired.
                </p>
              </div>
            </div>
          ) : /* Auto-blurred content */
          post.isAutoBlurred || (post.isHidden && !isRevealed) ? (
            <div className="relative mb-3">
              <div className="bg-muted/80 backdrop-blur-sm rounded-lg p-8 text-center border border-border">
                <p className="text-muted-foreground mb-4">
                  This tweet has been automatically blurred due to content policy. Click below to reveal.
                </p>
                <Button onClick={handleReveal} className="bg-blue-500 hover:bg-blue-600">
                  Reveal Tweet
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-foreground whitespace-pre-wrap mb-3">{post.content}</p>

              {post.image && (
                <div className="rounded-2xl overflow-hidden mb-3 border border-border">
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{formatNumber(post.comments)}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRepost}
              className={cn(
                "gap-2 transition-colors",
                isReposted
                  ? "text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                  : "text-muted-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20"
              )}
            >
              <Repeat2 className={cn("w-5 h-5", isReposted && "stroke-[2.5px]")} />
              <span>{formatNumber(post.reposts)}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "gap-2 transition-colors",
                isLiked 
                  ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" 
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              )}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
              <span>{formatNumber(post.likes)}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <Share className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Flag className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleReport("harassment")}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Harassment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReport("hate_speech")}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Hate Speech
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReport("threats")}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Threats
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReport("spam")}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Spam
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReport("inappropriate")}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Inappropriate Content
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <CommentDialog
        post={post}
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
      />
    </motion.article>
  );
};
