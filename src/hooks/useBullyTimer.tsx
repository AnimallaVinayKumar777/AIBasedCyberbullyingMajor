import { useState, useEffect } from 'react';
import { ModeratedPost } from '@/utils/postModeration';

export interface TimerState {
  timeRemaining: number; // in seconds
  isActive: boolean;
  isExpired: boolean;
}

export const useBullyTimer = (post: ModeratedPost): TimerState => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    // Check if this is a bully post with a timer
    if (!post.isBully || !post.bullyTimerStart || !post.autoBlurTime) {
      setIsActive(false);
      setIsExpired(false);
      setTimeRemaining(0);
      return;
    }

    // Debug log to verify 2-second timer
    console.log(`🕒 Bully post timer started for post "${post.content.substring(0, 30)}..." - Will auto-blur in 2 seconds`);

    // Check if already auto-blurred or deleted
    if (post.isAutoBlurred || post.isAutoDeleted) {
      setIsActive(false);
      setIsExpired(true);
      setTimeRemaining(0);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = post.autoBlurTime!.getTime();
      const remaining = Math.max(0, endTime - now);
      return Math.ceil(remaining / 1000); // Convert to seconds
    };

    // Set initial time
    const initialRemaining = calculateTimeRemaining();
    setTimeRemaining(initialRemaining);
    setIsActive(initialRemaining > 0);
    setIsExpired(initialRemaining <= 0);

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      setIsActive(remaining > 0);
      setIsExpired(remaining <= 0);

      if (remaining <= 0) {
        clearInterval(interval);
        console.log(`⏰ 2-second timer expired for bully post - Auto-moderation applied`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [post.isBully, post.bullyTimerStart, post.autoBlurTime, post.isAutoBlurred, post.isAutoDeleted]);

  return {
    timeRemaining,
    isActive,
    isExpired
  };
};

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "Expired";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  }

  return `${remainingSeconds}s`;
};