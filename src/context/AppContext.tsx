import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post, User, Notification, Comment, mockPosts, mockUsers, mockNotifications } from '@/data/mockData';
import { ModeratedPost, postModerationService } from '@/utils/postModeration';
import { useAuth } from '@/context/AuthContext';

interface AppState {
  posts: ModeratedPost[];
  users: User[];
  notifications: Notification[];
  currentUser: User;
  followedUsers: Set<string>;
  likedPosts: Set<string>;
  repostedPosts: Set<string>;
}

interface AppContextType extends AppState {
  addPost: (content: string, image?: string) => void;
  toggleLike: (postId: string) => void;
  toggleRepost: (postId: string) => void;
  toggleFollow: (userId: string) => void;
  addComment: (postId: string, content: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  searchUsers: (query: string) => User[];
  searchPosts: (query: string) => ModeratedPost[];
  clearAllPosts: () => void;
  exportPostsData: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser } = useAuth();

  // Load posts from localStorage or use mock data as fallback
  const loadPosts = (): ModeratedPost[] => {
    try {
      const savedPosts = localStorage.getItem('chirp_posts');
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts);
        // Convert timestamp strings back to Date objects
        return parsedPosts.map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp),
          author: {
            ...post.author,
            // Ensure avatar is set for existing posts
            avatar: post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`
          }
        }));
      }
    } catch (error) {
      console.error('Error loading posts from localStorage:', error);
    }
    return mockPosts;
  };

  const [posts, setPosts] = useState<ModeratedPost[]>(loadPosts());
  const [users] = useState<User[]>(mockUsers);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  // Update currentUser when authUser changes
  const [currentUser, setCurrentUser] = useState<User>(authUser || mockUsers[0]);

  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [repostedPosts, setRepostedPosts] = useState<Set<string>>(new Set());

  // Save posts to localStorage whenever posts change
  useEffect(() => {
    try {
      localStorage.setItem('chirp_posts', JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving posts to localStorage:', error);
    }
  }, [posts]);

  const addPost = (content: string, image?: string) => {
    if (!authUser) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        ...authUser,
        // Ensure avatar is set
        avatar: authUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.name}`
      },
      content,
      image,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      reposts: 0,
      isLiked: false,
    };

    // Process through moderation service
    let moderatedPost = postModerationService.processPost(newPost);

    // Add to beginning of posts array and process with timers
    const updatedPosts = [moderatedPost, ...posts];
    const postsWithTimers = postModerationService.processPostsWithTimers(updatedPosts);
    setPosts(postsWithTimers);
  };

  const toggleLike = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: newLikedPosts.has(postId) ? post.likes + 1 : post.likes - 1,
          isLiked: newLikedPosts.has(postId),
        } as ModeratedPost;
      }
      return post;
    });

    // Process with timers for bully posts
    const postsWithTimers = postModerationService.processPostsWithTimers(updatedPosts);
    setPosts(postsWithTimers);
  };

  const toggleRepost = (postId: string) => {
    const newRepostedPosts = new Set(repostedPosts);
    if (newRepostedPosts.has(postId)) {
      newRepostedPosts.delete(postId);
    } else {
      newRepostedPosts.add(postId);
    }
    setRepostedPosts(newRepostedPosts);

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          reposts: newRepostedPosts.has(postId) ? post.reposts + 1 : post.reposts - 1,
        } as ModeratedPost;
      }
      return post;
    });

    // Process with timers for bully posts
    const postsWithTimers = postModerationService.processPostsWithTimers(updatedPosts);
    setPosts(postsWithTimers);
  };

  const toggleFollow = (userId: string) => {
    const newFollowedUsers = new Set(followedUsers);
    if (newFollowedUsers.has(userId)) {
      newFollowedUsers.delete(userId);
    } else {
      newFollowedUsers.add(userId);
    }
    setFollowedUsers(newFollowedUsers);
  };

  const addComment = (postId: string, content: string) => {
    if (!authUser) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: Date.now().toString(),
          author: authUser,
          content,
          timestamp: new Date(),
        };
        return {
          ...post,
          comments: post.comments + 1,
          commentList: [...(post.commentList || []), newComment],
        } as ModeratedPost;
      }
      return post;
    });

    // Process with timers for bully posts
    const postsWithTimers = postModerationService.processPostsWithTimers(updatedPosts);
    setPosts(postsWithTimers);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const searchUsers = (query: string): User[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.handle.toLowerCase().includes(lowerQuery)
    );
  };

  const searchPosts = (query: string): ModeratedPost[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return posts.filter(post =>
      post.content.toLowerCase().includes(lowerQuery) ||
      post.author.name.toLowerCase().includes(lowerQuery)
    );
  };

  // Utility function to clear all posts (for testing/debugging)
  const clearAllPosts = () => {
    setPosts([]);
    localStorage.removeItem('chirp_posts');
  };

  // Utility function to export posts data
  const exportPostsData = () => {
    const data = {
      posts: posts,
      exportedAt: new Date().toISOString(),
      totalPosts: posts.length
    };
    return JSON.stringify(data, null, 2);
  };

  // Debug function to check posts persistence (available in browser console)
  (window as any).chirpDebug = {
    getPosts: () => posts,
    clearAllPosts,
    exportPostsData,
    getStorageSize: () => {
      const postsData = localStorage.getItem('chirp_posts');
      return postsData ? `${Math.round(JSON.stringify(JSON.parse(postsData)).length / 1024)}KB` : '0KB';
    }
  };

  return (
    <AppContext.Provider
      value={{
        posts,
        users,
        notifications,
        currentUser,
        followedUsers,
        likedPosts,
        repostedPosts,
        addPost,
        toggleLike,
        toggleRepost,
        toggleFollow,
        addComment,
        markNotificationAsRead,
        searchUsers,
        searchPosts,
        clearAllPosts,
        exportPostsData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
