import { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share, Flag, AlertTriangle } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CommentDialog } from '@/components/CommentDialog';
import { postModerationService } from '@/utils/postModeration';

// Function to highlight bully words in content
const highlightBullyWords = (content: string, bullyWords: string[]): string => {
  if (!content) return '';
  if (!bullyWords.length) return content;

  let highlightedContent = content;
  bullyWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    highlightedContent = highlightedContent.replace(regex, `<span class="bg-red-200 text-red-800 px-1 rounded font-semibold">$&</span>`);
  });
  return highlightedContent;
};

interface PostCardProps {
  post: ModeratedPost;
}

export const PostCard = ({ post }: PostCardProps) => {
  if (!post || !post.id) {
    console.error('PostCard received invalid post:', post);
    return null;
  }
  const { toggleLike, toggleRepost, likedPosts, repostedPosts } = useApp();
  const { user } = useAuth();
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const isLiked = likedPosts.has(post.id);
  const isReposted = repostedPosts.has(post.id);

  // All content is shown (including bully posts - with warning badge and blur)

  const contentJSX = (
    <>
      <p
        className={cn(
          "text-foreground whitespace-pre-wrap mb-3",
          post.isBully && "blur-sm select-none transition-all duration-300 hover:blur-0 cursor-pointer"
        )}
        dangerouslySetInnerHTML={{
          __html: highlightBullyWords(post.content || '', post.cyberbullyingResult?.detectedWords || [])
        }}
      />

      {post.image && (
        <div className="rounded-2xl overflow-hidden mb-3 border border-border">
          <img
            src={post.image}
            alt="Post content"
            className={cn(
              "w-full h-auto object-cover",
              post.isBully && "blur-sm select-none transition-all duration-300 hover:blur-0 cursor-pointer"
            )}
          />
        </div>
      )}
    </>
  );

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

  const formatNumber = (num: number | undefined | null) => {
    if (num == null || isNaN(num)) return '0';
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
          <AvatarFallback>{post.author.name?.[0] || '?'}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-semibold text-foreground hover:underline truncate">
              {post.author.name || 'Unknown'}
            </span>
            <span className="text-muted-foreground text-sm truncate">
              {post.author.handle || '@unknown'}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm flex-shrink-0">
              {formatTimestamp(post.timestamp)}
            </span>
          </div>

          {/* Status badges */}
          <div className="flex gap-2 mb-2">
            {post.isBully && (
              <>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                  OK
                </Badge>
                <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                  Bully
                </Badge>
              </>
            )}
            {post.isReported && (
              <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">
                Reported
              </Badge>
            )}
          </div>

          {/* Post content - always shown */}
          {post.isHidden ? (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-300 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400">
                This post has been hidden due to policy violations.
              </p>
            </div>
          ) : (
            contentJSX
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
