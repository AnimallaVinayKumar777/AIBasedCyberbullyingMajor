import { useState, useEffect, useRef } from 'react';
import { ModeratedPost } from '@/utils/postModeration';

export interface EditTimerState {
  timeRemaining: number; // in seconds
  isActive: boolean;
  isExpired: boolean;
  hasEditChance: boolean;
}

export const useEditTimer = (post: ModeratedPost): EditTimerState => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [hasEditChance, setHasEditChance] = useState<boolean>(false);
  
  // Use ref to track if timer was already initialized for this post
  const timerInitializedRef = useRef<boolean>(false);
  const postIdRef = useRef<string>('');

  useEffect(() => {
    // Check if this is a bully post with edit chance
    if (!post.isBully || !post.editTimerStart || !post.editTimeLimit || !post.hasEditChance) {
      setIsActive(false);
      setIsExpired(false);
      setTimeRemaining(0);
      setHasEditChance(false);
      timerInitializedRef.current = false;
      postIdRef.current = '';
      return;
    }

    // Skip if timer already initialized for this post (prevents duplicate timers on re-renders)
    if (timerInitializedRef.current && postIdRef.current === post.id) {
      return;
    }
    
    // Mark timer as initialized for this post
    timerInitializedRef.current = true;
    postIdRef.current = post.id;

    // Debug log
    console.log(`🕒 Edit timer started for bully post "${post.content.substring(0, 30)}..." - Will expire in 5 minutes`);

    // Check if already expired or email sent
    if (post.editEmailSent) {
      setIsActive(false);
      setIsExpired(true);
      setTimeRemaining(0);
      setHasEditChance(false);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = post.editTimeLimit!.getTime();
      const remaining = Math.max(0, endTime - now);
      return Math.ceil(remaining / 1000); // Convert to seconds
    };

    // Set initial time
    const initialRemaining = calculateTimeRemaining();
    setTimeRemaining(initialRemaining);
    setIsActive(initialRemaining > 0);
    setIsExpired(initialRemaining <= 0);
    setHasEditChance(post.hasEditChance);

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      setIsActive(remaining > 0);
      setIsExpired(remaining <= 0);

      if (remaining <= 0) {
        clearInterval(interval);
        console.log(`⏰ 5-minute edit timer expired for bully post - Post flagged and email warning sent`);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      // Don't reset refs here - they should persist to prevent timer restart on re-renders
    };
  }, [post.isBully, post.editTimerStart, post.editTimeLimit, post.hasEditChance, post.editEmailSent, post.id]);

  return {
    timeRemaining,
    isActive,
    isExpired,
    hasEditChance
  };
};

export const formatEditTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "Expired";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  }

  return `${remainingSeconds}s`;
};