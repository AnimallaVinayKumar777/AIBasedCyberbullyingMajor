import { detectCyberbullying, getPostModerationAction, CyberbullyingResult } from './cyberbullyingDetection';
import { Post } from '@/data/mockData';
import { emailService } from './emailService';
import { sqliteDB } from './sqliteDatabase';

export interface ModeratedPost extends Post {
  cyberbullyingResult?: CyberbullyingResult;
  moderationAction?: 'hide' | 'flag' | 'none';
  isHidden?: boolean;
  isBully?: boolean;
  isReported?: boolean;
  isAutoDeleted?: boolean;
  warningEmailSent?: boolean;
  deactivationEmailSent?: boolean;
}

export class PostModerationService {
  /**
   * Process a post through the moderation system
   * Automatically deletes bully posts from database and sends email notification
   */
  async processPost(post: Post): Promise<ModeratedPost> {
    console.log('🛡️ ====== Starting post moderation ======');
    console.log('🛡️ Post content:', post.content);
    console.log('🛡️ Author:', post.author.name);
    
    // Use multilingual detection
    const cyberbullyingResult = await detectCyberbullying(post.content);
    console.log('🛡️ Detection result:', cyberbullyingResult);
    
    const moderationAction = await getPostModerationAction(post.content);
    console.log('🛡️ Moderation action:', moderationAction);
    
    // Determine if this is a bully post (any detected cyberbullying)
    const isBully = cyberbullyingResult.isCyberbullying;
    console.log('🛡️ Is bully:', isBully);

    // If it's a bully post, auto-delete it and send immediate email notification
    if (isBully) {
      console.log('🛡️ ⚠️ Bully post detected! Sending email and hiding post...');
      console.log('🛡️ Detection details:');
      console.log('  - Severity:', cyberbullyingResult.severity);
      console.log('  - Categories:', cyberbullyingResult.categories);
      console.log('  - Confidence:', cyberbullyingResult.confidence);
      console.log('  - Detected words:', cyberbullyingResult.detectedWords);
      
      // Get user email - use author's actual email
      const userEmail = post.author.email;
      console.log('🛡️ 📧 Sending email to:', userEmail);
      console.log('🛡️ 📧 Author name:', post.author.name);
      console.log('🛡️ 📧 Author handle:', post.author.handle);
      
      // Send immediate warning email about the flagged post
      try {
        console.log('🛡️ 📧 Attempting to send email...');
        const emailSent = await emailService.sendAccountWarningEmail(
          userEmail,
          post.author.name,
          post.content,
          post.author.handle
        );
        console.log('🛡️ 📧 Email send result:', emailSent);
      } catch (error) {
        console.error('🛡️ 📧 Error sending warning email:', error);
      }

      // Auto-delete the bully post - mark as hidden and auto-deleted
      return {
        ...post,
        cyberbullyingResult,
        moderationAction: 'hide', // Hide the post
        isHidden: true, // Hide in UI
        isBully: true,
        isReported: false,
        isAutoDeleted: true, // Mark as auto-deleted
        warningEmailSent: true
      };
    }

    // For non-bully posts, process normally
    console.log('🛡️ ✅ Post is clean, allowing through');
    return {
      ...post,
      cyberbullyingResult,
      moderationAction,
      isHidden: false,
      isBully: false,
      isReported: false,
      isAutoDeleted: false
    };
  }

  async processPosts(posts: Post[]): Promise<ModeratedPost[]> {
    const promises = posts.map(post => this.processPost(post));
    return await Promise.all(promises);
  }

  reportPost(postId: string, reason: string): void {
    // In a real app, this would update the database
    console.log(`Post ${postId} reported for: ${reason}`);
  }

  getModerationStats(posts: ModeratedPost[]): {
    totalPosts: number;
    hiddenPosts: number;
    bullyPosts: number;
    reportedPosts: number;
    flaggedPosts: number;
    autoDeletedPosts: number;
  } {
    return {
      totalPosts: posts.length,
      hiddenPosts: posts.filter(p => p.isHidden).length,
      bullyPosts: posts.filter(p => p.isBully).length,
      reportedPosts: posts.filter(p => p.isReported).length,
      flaggedPosts: posts.filter(p => p.moderationAction === 'flag').length,
      autoDeletedPosts: posts.filter(p => p.isAutoDeleted).length
    };
  }

  /**
   * Process posts with timers - simplified version without edit timers
   * All bully posts are auto-deleted immediately upon detection
   */
  async processPostsWithTimers(posts: ModeratedPost[]): Promise<ModeratedPost[]> {
    const processedPosts = await Promise.all(posts.map(async post => {
      // Re-process the post through moderation service to get fresh results
      const moderatedPost = await this.processPost(post);

      let processedPost: ModeratedPost = {
        ...moderatedPost,
        // Preserve email sent flags
        warningEmailSent: post.warningEmailSent || moderatedPost.warningEmailSent,
        deactivationEmailSent: post.deactivationEmailSent,
        // Preserve auto-delete fields
        isAutoDeleted: post.isAutoDeleted || moderatedPost.isAutoDeleted,
      };

      return processedPost;
    }));

    return processedPosts;
  }
}

export const postModerationService = new PostModerationService();
