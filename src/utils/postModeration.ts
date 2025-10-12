import { detectCyberbullying, getPostModerationAction, CyberbullyingResult } from './cyberbullyingDetection';
import { Post } from '@/data/mockData';

export interface ModeratedPost extends Post {
  cyberbullyingResult?: CyberbullyingResult;
  moderationAction?: 'hide' | 'flag' | 'none';
  isHidden?: boolean;
  isBully?: boolean;
  isReported?: boolean;
  bullyTimerStart?: Date;
  autoBlurTime?: Date;
  isAutoBlurred?: boolean;
  isAutoDeleted?: boolean;
}

export class PostModerationService {
  processPost(post: Post): ModeratedPost {
    console.log(`⚙️ Processing post: "${post.content.substring(0, 50)}..."`);
    const cyberbullyingResult = detectCyberbullying(post.content);
    const moderationAction = getPostModerationAction(post.content);

    const moderatedPost: ModeratedPost = {
      ...post,
      cyberbullyingResult,
      moderationAction,
      isHidden: moderationAction === 'hide',
      isBully: cyberbullyingResult.isCyberbullying && cyberbullyingResult.severity !== 'low',
      isReported: false // This would be set when users report posts
    };

    console.log(`✅ Post processed - isBully: ${moderatedPost.isBully}, severity: ${cyberbullyingResult.severity}`);
    return moderatedPost;
  }

  processPosts(posts: Post[]): ModeratedPost[] {
    return posts.map(post => this.processPost(post));
  }

  reportPost(postId: string, reason: string): void {
    // In a real app, this would update the database
    console.log(`Post ${postId} reported for: ${reason}`);

    // For now, we'll just log it
    // In a production app, you'd want to:
    // 1. Store the report in a database
    // 2. Increment a report count for the post
    // 3. Potentially hide the post if it gets enough reports
    // 4. Notify moderators
  }

  getModerationStats(posts: ModeratedPost[]): {
    totalPosts: number;
    hiddenPosts: number;
    bullyPosts: number;
    reportedPosts: number;
    flaggedPosts: number;
    autoBlurredPosts: number;
    autoDeletedPosts: number;
  } {
    return {
      totalPosts: posts.length,
      hiddenPosts: posts.filter(p => p.isHidden).length,
      bullyPosts: posts.filter(p => p.isBully).length,
      reportedPosts: posts.filter(p => p.isReported).length,
      flaggedPosts: posts.filter(p => p.moderationAction === 'flag').length,
      autoBlurredPosts: posts.filter(p => p.isAutoBlurred).length,
      autoDeletedPosts: posts.filter(p => p.isAutoDeleted).length
    };
  }

  // Timer management for bully posts
  startBullyTimer(post: ModeratedPost): ModeratedPost {
    if (!post.isBully || post.bullyTimerStart) {
      return post;
    }

    const now = new Date();
    const autoBlurTime = new Date(now.getTime() + 2 * 1000); // 2 seconds from now (for testing)

    return {
      ...post,
      bullyTimerStart: now,
      autoBlurTime
    };
  }

  checkAndApplyAutoModeration(post: ModeratedPost): ModeratedPost {
    if (!post.isBully || !post.bullyTimerStart || !post.autoBlurTime) {
      return post;
    }

    const now = new Date();
    const timeElapsed = now.getTime() - post.bullyTimerStart.getTime();
    const twoSecondsInMs = 2 * 1000; // 2 seconds for testing

    if (timeElapsed >= twoSecondsInMs) {
      // Auto-blur after 2 minutes for medium severity
      if (post.cyberbullyingResult?.severity === 'medium') {
        return {
          ...post,
          isAutoBlurred: true,
          isHidden: true
        };
      }
      // Auto-delete for high severity
      else if (post.cyberbullyingResult?.severity === 'high') {
        return {
          ...post,
          isAutoDeleted: true
        };
      }
    }

    return post;
  }

  processPostsWithTimers(posts: ModeratedPost[]): ModeratedPost[] {
    return posts.map(post => {
      // Start timer for new bully posts
      let processedPost = this.startBullyTimer(post);

      // Check and apply auto-moderation
      processedPost = this.checkAndApplyAutoModeration(processedPost);

      return processedPost;
    });
  }
}

export const postModerationService = new PostModerationService();