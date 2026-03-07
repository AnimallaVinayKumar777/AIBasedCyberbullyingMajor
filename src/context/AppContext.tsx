import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { sqliteDB, DatabasePost } from '@/utils/sqliteDatabase';
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
  addPost: (content: string, image?: string) => Promise<void>;
  editPost: (postId: string, newContent: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleRepost: (postId: string) => Promise<void>;
  toggleFollow: (userId: string) => void;
  addComment: (postId: string, content: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  searchUsers: (query: string) => User[];
  searchPosts: (query: string) => ModeratedPost[];
  clearAllPosts: () => Promise<void>;
  exportPostsData: () => string;
  addUser: (user: User) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  revealPostContent: (postId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user: authUser } = useAuth();

  // Load posts from database
  const loadPosts = async (): Promise<ModeratedPost[]> => {
    try {
      await sqliteDB.initialize();
      console.log('💾 Database mode:', sqliteDB.isUsingLocalStorage() ? 'localStorage' : 'PostgreSQL');
      const dbPosts = await sqliteDB.getAllPosts();
      console.log('🔍 Loading posts from database:', dbPosts.length, 'posts found');
      console.log('👤 Current user when loading:', currentUser?.name || 'No user');
      console.log('📊 Database posts authors:', dbPosts.map(p => ({ author: p.author_name, id: p.author_id })).slice(0, 5)); // First 5
      console.log('🔍 All database posts details:', dbPosts.map(p => `${p.author_name} (${p.author_id}): ${p.content.substring(0, 30)}...`));

      if (dbPosts.length > 0) {
        console.log('dbPosts length:', dbPosts.length);
        console.log('dbPosts sample:', dbPosts.slice(0,3));
        console.log('dbPosts has undefined:', dbPosts.some(p => p === undefined));

        // Transform posts from MongoDB API: map '_id' to 'id' and other field mappings
        const transformedPosts = dbPosts.map((post, index) => {
          const newId = post.id || post._id?.toString();
          console.log(`🔄 Transforming post ${index} in loadPosts: original id=${post.id}, _id=${post._id}, newId=${newId}, categories=${JSON.stringify(post.categories)}, cyberbullying_categories=${JSON.stringify(post.cyberbullying_categories)}`);
          return {
            ...post,
            id: newId, // Use id if present (Mongoose getter), else _id.toString()
            reposts: post.shares || post.reposts || 0, // Map shares to reposts
            image: post.media_urls || post.image, // Map media_urls to image
            is_cyberbullying: post.cyberbullying_detected || post.is_cyberbullying,
            severity: post.cyberbullying_severity || post.severity,
            categories: post.cyberbullying_categories || post.categories,
          };
        });

        // Convert database posts to ModeratedPost format
        const processedPosts: ModeratedPost[] = transformedPosts.map((dbPost, index): ModeratedPost | undefined => {
          console.log(`🔍 Processing dbPost ${index} in loadPosts: id=${dbPost.id}, _id=${dbPost._id}, categories=${dbPost.categories}`);
          if (!dbPost || !dbPost.id) {
            console.error('Invalid dbPost at index', index, 'dbPost:', dbPost);
            return undefined;
          }
          const isBully = dbPost.is_bully ?? dbPost.cyberbullying_detected ?? false;
          console.log(`🔄 Loading post ${dbPost.id} from DB: cyberbullying_detected=${dbPost.cyberbullying_detected}, isBully=${isBully}, content="${dbPost.content?.substring(0, 50)}..."`);
          let parsedCategories = [];
          if (Array.isArray(dbPost.categories)) {
            parsedCategories = dbPost.categories;
            console.log(`✅ Categories for post ${dbPost.id} is already array:`, parsedCategories);
          } else if (typeof dbPost.categories === 'string') {
            try {
              parsedCategories = JSON.parse(dbPost.categories);
              console.log(`✅ Parsed categories for post ${dbPost.id}:`, parsedCategories);
            } catch (error) {
              console.error(`❌ JSON.parse error for post ${dbPost.id} categories:`, dbPost.categories, error);
              parsedCategories = [];
            }
          } else {
            parsedCategories = [];
            console.log(`⚠️ Categories for post ${dbPost.id} is neither array nor string:`, dbPost.categories);
          }
          
          // Create a basic ModeratedPost from the database
          return {
            id: dbPost.id,
            author: {
              id: dbPost.author_id,
              name: dbPost.author_name || 'Unknown',
              handle: dbPost.author_handle || '@unknown',
              email: dbPost.author_email || '',
              avatar: dbPost.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbPost.author_id}`,
              followers: 0, // SQLite doesn't store follower counts for posts
              following: 0
            },
            content: dbPost.content,
            image: dbPost.image,
            timestamp: new Date(dbPost.timestamp),
            likes: dbPost.likes,
            comments: dbPost.comments,
            reposts: dbPost.reposts,
            isLiked: false, // Will be set based on user interactions
            cyberbullyingResult: {
              isCyberbullying: dbPost.is_cyberbullying || false,
              severity: (dbPost.severity as 'low' | 'medium' | 'high') || 'low',
              categories: parsedCategories,
              confidence: 0.8
            },
            moderationAction: (dbPost.moderation_action as 'hide' | 'flag' | 'none') || 'none',
            isHidden: dbPost.is_hidden || false,
            isBully,
            isReported: dbPost.is_reported || false,
            isAutoDeleted: dbPost.is_bully ?? dbPost.is_cyberbullying ?? false
          };
        });

        const filteredPosts = processedPosts.filter(p => p !== undefined) as ModeratedPost[];
        
        // Filter out bully posts and hidden posts from UI
        const visiblePosts = filteredPosts.filter(post => {
          // Skip if post is bully or hidden
          if (post.isBully || post.isHidden) {
            console.log(`🚫 Filtering out bully/hidden post: ${post.id} - isBully=${post.isBully}, isHidden=${post.isHidden}`);
            return false;
          }
          return true;
        });
        
        console.log('✅ Posts after filtering out bullies:', visiblePosts.length, 'out of', filteredPosts.length);
        
        // Don't re-process through moderation service - use stored results from database
        // This prevents previously-OK posts from being incorrectly flagged as bully
        console.log('✅ Successfully loaded posts from database:', visiblePosts.length);
        return visiblePosts;
      } else {
        console.log('📋 No saved posts found, using mock data');
      }
    } catch (error) {
      console.error('❌ Error loading posts from SQLite DB:', error);
    }

    console.log('📋 Using mock posts as fallback');
    return mockPosts;
  };

  const [posts, setPosts] = useState<ModeratedPost[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  // Update currentUser when authUser changes
  const [currentUser, setCurrentUser] = useState<User>(authUser || mockUsers[0]);

  useEffect(() => {
    if (authUser) {
      console.log('🔄 Updating currentUser to:', authUser.name, authUser.handle);
      setCurrentUser(authUser);
    } else {
      console.log('🔄 No authenticated user, using fallback');
    }
  }, [authUser]);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [repostedPosts, setRepostedPosts] = useState<Set<string>>(new Set());

  // Ref to track recent mutations and prevent sync loops
  const lastMutationTime = useRef<number>(0);
  const MUTATION_COOLDOWN = 2000; // 2 seconds cooldown after mutations

  // Helper to get the actual post ID (handles both 'id' and '_id' fields)
  const getPostId = (post: any): string | undefined => {
    return post.id || post._id?.toString();
  };

  // Load posts and users from SQLite database on component mount and user change
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('🚀 Starting initial data load for user:', authUser?.name || 'No user');

        // Initialize database first
        await sqliteDB.initialize();
        console.log('✅ SQLite database initialized');

        // Load posts using the existing loadPosts function
        const loadedPosts = await loadPosts();
        setPosts(loadedPosts);
        console.log('🏁 Posts loaded:', loadedPosts.length);

        // Load users
        const dbUsers = await sqliteDB.getAllUsers();
        console.log('👥 Users in database:', dbUsers.length);

        if (dbUsers.length > 0) {
          // Convert database users to app format
          const appUsers: User[] = dbUsers.map(dbUser => ({
            id: dbUser.id,
            name: dbUser.name,
            handle: dbUser.handle,
            email: dbUser.email,
            avatar: dbUser.avatar,
            bio: dbUser.bio,
            followers: dbUser.followers,
            following: dbUser.following,
            verified: dbUser.verified
          }));
          setUsers(appUsers);
          console.log('👥 Users loaded from SQLite:', appUsers.length);
        } else {
          console.log('👥 No users in database, using mock users');
          setUsers(mockUsers);
        }

        console.log('🎉 Initial data load completed');
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
        setPosts(mockPosts);
        setUsers(mockUsers);
      }
    };

    loadInitialData();
  }, [authUser]); // Re-run when user changes

  // Set up real-time synchronization with SQLite and cross-tab updates
  useEffect(() => {
    // Skip if we're in cooldown period (prevents loops when we just added/edited a post)
    if (Date.now() - lastMutationTime.current < MUTATION_COOLDOWN) {
      return;
    }
    
    // Helper to get the actual post ID (handles both 'id' and '_id' fields)
    const getPostId = (post: any): string | undefined => {
      return post.id || post._id?.toString();
    };
    
    const checkForUpdates = async () => {
      try {
        await sqliteDB.initialize();
        const currentDbPosts = await sqliteDB.getAllPosts();

        // Get first post IDs for comparison
        const dbFirstId = getPostId(currentDbPosts[0]);
        const memoryFirstId = getPostId(posts[0]);
        
        // Only update if posts actually changed (compare first post ID)
        const postsChanged = currentDbPosts.length !== posts.length || 
          (currentDbPosts.length > 0 && posts.length > 0 && dbFirstId !== memoryFirstId);

        if (postsChanged) {
          console.log('🔄 Posts changed, updating from database...');

          // Transform posts from MongoDB API: map '_id' to 'id' and other field mappings
          const transformedPosts = currentDbPosts.map((post) => {
            const newId = getPostId(post);
            return {
              ...post,
              id: newId,
              reposts: post.shares || post.reposts || 0,
              image: post.media_urls || post.image,
              is_cyberbullying: post.cyberbullying_detected || post.is_cyberbullying,
              severity: post.cyberbullying_severity || post.severity,
              categories: post.cyberbullying_categories || post.categories,
            };
          });

          // Convert database posts to ModeratedPost format and re-process through moderation service
          const processedPosts: ModeratedPost[] = transformedPosts.map((dbPost): ModeratedPost | undefined => {
            if (!dbPost || !dbPost.id) return undefined;
            
            // Handle categories - MongoDB returns arrays, localStorage returns JSON strings
            let parsedCategories: string[] = [];
            if (Array.isArray(dbPost.categories)) {
              parsedCategories = dbPost.categories;
            } else if (typeof dbPost.categories === 'string') {
              try {
                parsedCategories = JSON.parse(dbPost.categories);
              } catch {
                parsedCategories = [];
              }
            }
            
            return {
              id: dbPost.id,
              author: {
                id: dbPost.author_id,
                name: dbPost.author_name || 'Unknown',
                handle: dbPost.author_handle || '@unknown',
                email: dbPost.author_email || '',
                avatar: dbPost.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbPost.author_id}`,
                followers: 0,
                following: 0
              },
              content: dbPost.content,
              image: dbPost.image,
              timestamp: new Date(dbPost.timestamp),
              likes: dbPost.likes,
              comments: dbPost.comments,
              reposts: dbPost.reposts,
              isLiked: false,
              cyberbullyingResult: {
                isCyberbullying: dbPost.is_cyberbullying || false,
                severity: (dbPost.severity as 'low' | 'medium' | 'high') || 'low',
                categories: parsedCategories,
                confidence: 0.8
              },
              moderationAction: (dbPost.moderation_action as 'hide' | 'flag' | 'none') || 'none',
              isHidden: dbPost.is_hidden || false,
              isBully: dbPost.is_bully ?? dbPost.cyberbullying_detected ?? false,
              isReported: dbPost.is_reported || false,
              isAutoDeleted: dbPost.is_bully ?? dbPost.cyberbullying_detected ?? false
            };
          });

          const filteredPosts = processedPosts.filter(p => p !== undefined) as ModeratedPost[];
          
          // Filter out bully posts and hidden posts from UI
          const visiblePosts = filteredPosts.filter(post => {
            // Skip if post is bully or hidden
            if (post.isBully || post.isHidden) {
              return false;
            }
            return true;
          });
          
          // Don't re-process through moderation service - use stored results from database
          // This prevents previously-OK posts from being incorrectly flagged as bully
          setPosts(visiblePosts);
          console.log('✅ Posts synchronized from database:', visiblePosts.length, 'out of', filteredPosts.length);
        }
      } catch (error) {
        console.error('❌ Error checking for DB updates:', error);
      }
    };

    // Check for updates every 30 seconds
    const interval = setInterval(checkForUpdates, 30000);

    // Listen for cross-tab storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chirp_posts' || e.key === 'chirp_db_updated') {
        console.log('🔄 Cross-tab update detected');
        checkForUpdates();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [posts.length]);

  // Posts are now saved directly in addPost function
  // This useEffect is no longer needed as we're saving immediately

  const addPost = async (content: string, image?: string) => {
    // Mark that we just mutated the data - sync should skip for a bit
    lastMutationTime.current = Date.now();
    
    if (!authUser) return;

    try {
      const newPost: Post = {
        id: `${authUser.id}_${Date.now()}`,
        author: {
          ...authUser,
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

      console.log('📝 ====== Creating new post ======');
      console.log('📝 Author object:', JSON.stringify(newPost.author, null, 2));
      console.log('📝 Author email:', newPost.author.email);
      console.log('📝 Author name:', newPost.author.name);
      console.log('📝 Author handle:', newPost.author.handle);

      // Process through moderation service
      let moderatedPost = await postModerationService.processPost(newPost);
      console.log('🛡️ Moderation result for new post:', {
        isBully: moderatedPost.isBully,
        isHidden: moderatedPost.isHidden,
        moderationAction: moderatedPost.moderationAction,
        isAutoDeleted: moderatedPost.isAutoDeleted,
        severity: moderatedPost.cyberbullyingResult?.severity,
        categories: moderatedPost.cyberbullyingResult?.categories
      });

      // For bully posts, show in UI first (blurred), then auto-delete after delay
      if (moderatedPost.isBully) {
        console.log('⚠️ Bully post detected - showing blurred in UI, will auto-delete after delay');
        
        // Add to UI first (with blur/OK badge)
        setPosts(prev => [moderatedPost, ...prev]);
        console.log('✅ Bully post added to UI (will be auto-deleted):', moderatedPost.id);
        
        // Save to database with the flag
        try {
          await sqliteDB.initialize();
          await sqliteDB.insertPost({
            id: moderatedPost.id,
            author_id: moderatedPost.author.id,
            author_name: moderatedPost.author.name,
            author_handle: moderatedPost.author.handle,
            author_avatar: moderatedPost.author.avatar,
            author_email: moderatedPost.author.email || '',
            content: moderatedPost.content,
            image: moderatedPost.image,
            timestamp: moderatedPost.timestamp.toISOString(),
            likes: moderatedPost.likes,
            comments: moderatedPost.comments,
            reposts: moderatedPost.reposts,
            is_cyberbullying: moderatedPost.cyberbullyingResult?.isCyberbullying || false,
            severity: moderatedPost.cyberbullyingResult?.severity || 'low',
            categories: JSON.stringify(moderatedPost.cyberbullyingResult?.categories || []),
            moderation_action: moderatedPost.moderationAction || 'none',
            is_hidden: moderatedPost.isHidden || false,
            is_bully: moderatedPost.isBully || false,
            is_reported: moderatedPost.isReported || false
          });
          console.log('💾 Bully post saved to database');
        } catch (dbError) {
          console.warn('⚠️ Database save failed:', dbError);
        }
        
        // Auto-delete from UI after 5 seconds
        setTimeout(() => {
          setPosts(prev => prev.filter(p => p.id !== moderatedPost.id));
          console.log('🗑️ Bully post auto-deleted from UI:', moderatedPost.id);
        }, 5000);
        
        return; // Post is added to UI, will be auto-deleted
      }

      // Add to posts list (for non-bully posts)
      setPosts(prev => [moderatedPost, ...prev]);
      console.log('✅ Post added to UI:', moderatedPost.id);

      // Try to save to database (non-blocking, errors handled gracefully)
      // ALL posts are saved - including bully posts (they're saved with is_bully flag)
      try {
        await sqliteDB.initialize();
        await sqliteDB.insertPost({
          id: moderatedPost.id,
          author_id: moderatedPost.author.id,
          author_name: moderatedPost.author.name,
          author_handle: moderatedPost.author.handle,
          author_avatar: moderatedPost.author.avatar,
          author_email: moderatedPost.author.email || '',
          content: moderatedPost.content,
          image: moderatedPost.image,
          timestamp: moderatedPost.timestamp.toISOString(),
          likes: moderatedPost.likes,
          comments: moderatedPost.comments,
          reposts: moderatedPost.reposts,
          is_cyberbullying: moderatedPost.cyberbullyingResult?.isCyberbullying || false,
          severity: moderatedPost.cyberbullyingResult?.severity || 'low',
          categories: JSON.stringify(moderatedPost.cyberbullyingResult?.categories || []),
          moderation_action: moderatedPost.moderationAction || 'none',
          is_hidden: moderatedPost.isHidden || false,
          is_bully: moderatedPost.isBully || false,
          is_reported: moderatedPost.isReported || false
        });
        console.log('💾 Post saved to database');
      } catch (dbError) {
        // Database save failed, but post is already in UI - just log warning
        console.warn('⚠️ Database save failed (post still visible in UI):', dbError);
      }
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };
  const editPost = async (postId: string, newContent: string) => {
    // Mark that we just mutated the data - sync should skip for a bit
    lastMutationTime.current = Date.now();
    
    if (!authUser) {
      console.log('❌ Cannot edit post: No authenticated user');
      return;
    }

    console.log('✏️ Editing post:', postId, 'New content:', newContent.substring(0, 50) + '...');

    // Find the post to edit
    const postToEdit = posts.find(p => p.id === postId);
    if (!postToEdit) {
      console.error('❌ Post not found for editing:', postId);
      return;
    }

    // Create updated post with new content
    const updatedPost: Post = {
      ...postToEdit,
      content: newContent,
    };

    // Re-process through moderation service
    const reModeratedPost = await postModerationService.processPost(updatedPost);
    console.log('🛡️ Re-moderated post:', reModeratedPost);

    // For edited posts, clear the bully status
    const finalPost = {
      ...reModeratedPost,
      isBully: false,
      isAutoDeleted: false
    };

    // Update posts array directly
    const updatedPosts = posts.map(post =>
      post.id === postId ? finalPost : post
    );
    setPosts(updatedPosts);
    
    console.log('✅ Post edit completed successfully');

    // Update in SQLite database
    try {
      await sqliteDB.initialize();
      console.log('💾 Updating post in SQLite database...');

      const postData = {
        id: reModeratedPost.id,
        author_id: reModeratedPost.author.id,
        author_name: reModeratedPost.author.name,
        author_handle: reModeratedPost.author.handle,
        author_avatar: reModeratedPost.author.avatar,
        author_email: reModeratedPost.author.email || '',
        content: newContent, // Use the actual new content, not reModeratedPost.content
        image: reModeratedPost.image,
        timestamp: reModeratedPost.timestamp.toISOString(),
        likes: reModeratedPost.likes,
        comments: reModeratedPost.comments,
        reposts: reModeratedPost.reposts,
        is_cyberbullying: false, // Clear cyberbullying flag after edit
        severity: 'low',
        categories: '[]',
        moderation_action: 'none',
        is_hidden: false,
        is_bully: false, // Clear bully flag after edit
        is_reported: false
      };

      sqliteDB.updatePost(postData);

      console.log('✅ Post updated in SQLite database');
      
      // Trigger immediate cross-tab update notification
      localStorage.setItem('chirp_db_updated', Date.now().toString());
      
      // Force immediate refresh from database to get updated bully status
      const refreshedPosts = await loadPosts();
      setPosts(refreshedPosts);
      console.log('✅ Post edit completed and posts refreshed from database');
    } catch (error) {
      console.error('❌ Error updating post in SQLite database:', error);
    }
  };

  const toggleLike = async (postId: string) => {
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

    // Update posts directly without full re-processing
    setPosts(updatedPosts);
  };

  const toggleRepost = async (postId: string) => {
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

    // Update posts directly without full re-processing
    setPosts(updatedPosts);
  };

  const revealPostContent = async (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isHidden: false,
          isBully: false, // Clear bully flag to allow viewing
          isAutoDeleted: false
        } as ModeratedPost;
      }
      return post;
    });

    // Update posts directly without full re-processing
    setPosts(updatedPosts);
    
    return true;
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

  const addComment = async (postId: string, content: string) => {
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

    // Update posts directly without full re-processing
    setPosts(updatedPosts);
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

  // Add user to database
  const addUser = async (user: User) => {
    try {
      await sqliteDB.initialize();
      sqliteDB.insertUser({
        id: user.id,
        name: user.name,
        handle: user.handle,
        email: user.email || `${user.handle.replace('@', '')}@example.com`, // Use user's actual email if available
        avatar: user.avatar,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        verified: user.verified || false
      });

      // Update local state
      setUsers(prevUsers => [...prevUsers, user]);
      console.log('👤 User added to database:', user.name);
    } catch (error) {
      console.error('❌ Error adding user to database:', error);
    }
  };

  // Get all users from database
  const getAllUsers = async (): Promise<User[]> => {
    try {
      await sqliteDB.initialize();
      const dbUsers = await sqliteDB.getAllUsers();

      return dbUsers.map(dbUser => ({
        id: dbUser.id,
        name: dbUser.name,
        handle: dbUser.handle,
        email: dbUser.email,
        avatar: dbUser.avatar,
        bio: dbUser.bio,
        followers: dbUser.followers,
        following: dbUser.following,
        verified: dbUser.verified
      }));
    } catch (error) {
      console.error('❌ Error getting users from database:', error);
      return [];
    }
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
  const clearAllPosts = async () => {
    try {
      await sqliteDB.initialize();
      setPosts([]);
      sqliteDB.clearAllPosts();
      console.log('🗑️ All posts cleared from SQLite DB');
    } catch (error) {
      console.error('❌ Error clearing posts from SQLite DB:', error);
    }
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

  // Function to repair database issues
  const repairDatabase = async () => {
    console.log('🔧 Starting database repair process...');

    try {
      // Force close and reinitialize database
      console.log('1️⃣ Closing existing database...');
      sqliteDB.close();

      console.log('2️⃣ Reinitializing database...');
      await sqliteDB.initialize();

      console.log('3️⃣ Checking for orphaned data...');
      const posts = await sqliteDB.getAllPosts();
      const users = await sqliteDB.getAllUsers();

      console.log(`📋 Found ${posts.length} posts and ${users.length} users`);

      // Fix any posts with missing authors
      let fixedPosts = 0;
      posts.forEach(post => {
        if (!users.find(u => u.id === post.author_id)) {
          console.log(`🔧 Fixing orphaned post: ${post.content?.substring(0, 30)}...`);
          sqliteDB.updatePostHiddenStatus(post.id, false);
          fixedPosts++;
        }
      });

      if (fixedPosts > 0) {
        console.log(`✅ Fixed ${fixedPosts} orphaned posts`);
      }

      console.log('4️⃣ Running full database test...');
      // Test database with a simple insert/retrieve
      const testPost = {
        id: `repair_test_${Date.now()}`,
        author_id: 'repair_user',
        author_name: 'Repair User',
        author_handle: '@repair',
        author_avatar: 'repair_avatar',
        author_email: 'repair@example.com',
        content: 'Database repair test post',
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: 0,
        reposts: 0,
        is_cyberbullying: false,
        severity: 'low' as const,
        categories: '[]',
        moderation_action: 'none' as const,
        is_hidden: false,
        is_bully: false,
        is_reported: false
      };

      await sqliteDB.insertPost(testPost);
      const retrievedPosts = await sqliteDB.getAllPosts();
      const foundTestPost = retrievedPosts.find(p => p.id === testPost.id);

      if (foundTestPost) {
        console.log('✅ Database repair test PASSED');
        sqliteDB.deletePost(testPost.id);
        console.log('✅ Test cleanup completed');
      } else {
        console.log('❌ Database repair test FAILED');
      }

      console.log('✅ Database repair completed successfully');
      // Force refresh the app
      window.location.reload();

      return true;
    } catch (error) {
      console.error('❌ Database repair failed:', error);
      return false;
    }
  };

  // Function to fix incorrectly hidden posts
  const fixHiddenPosts = async () => {
    try {
      await sqliteDB.initialize();
      const allPosts = await sqliteDB.getAllPosts();

      console.log('🔧 Checking for incorrectly hidden posts...');
      let fixedCount = 0;

      allPosts.forEach(post => {
        // If post is hidden but doesn't meet hiding criteria, unhide it
        if (post.is_hidden && (!post.is_cyberbullying || post.severity !== 'high')) {
          console.log(`🔓 Unhiding post: ${post.content?.substring(0, 30)}...`);
          sqliteDB.updatePostHiddenStatus(post.id, false);
          fixedCount++;
        }
      });

      if (fixedCount > 0) {
        console.log(`✅ Fixed ${fixedCount} incorrectly hidden posts`);
        // Force refresh posts from database
        window.location.reload();
      } else {
        console.log('✅ No incorrectly hidden posts found');
      }

      return fixedCount;
    } catch (error) {
      console.error('❌ Error fixing hidden posts:', error);
      return 0;
    }
  };

  // Export database for sharing between browsers
  const exportDatabaseForSharing = async () => {
    try {
      await sqliteDB.initialize();
      const dbData = await sqliteDB.exportDatabase();

      // Convert string to Uint8Array for Blob
      const uint8Array = new TextEncoder().encode(dbData);
      const blob = new Blob([uint8Array], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `chirper_database_${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('💾 Database exported successfully');
      console.log('📤 Share this file with other browsers to import data');
      return true;
    } catch (error) {
      console.error('❌ Error exporting database:', error);
      return false;
    }
  };

  // Import database from file
  const importDatabaseFromFile = async (file: File) => {
    try {
      console.log('📥 Importing database from file...');
      const text = await file.text();

      await sqliteDB.initialize();
      await sqliteDB.importDatabase(text);

      console.log('✅ Database imported successfully');
      console.log('🔄 Refreshing page to load new data...');
      window.location.reload();

      return true;
    } catch (error) {
      console.error('❌ Error importing database:', error);
      return false;
    }
  };

  // Debug function to check posts persistence (available in browser console)
  (window as any).chirpDebug = {
    repairDatabase,
    fixHiddenPosts,
    exportDatabaseForSharing,
    importDatabaseFromFile,
    setApiBaseUrl: (url: string) => {
      console.log('🔧 Setting API Base URL to:', url);
      // Call the function directly since it's imported at module level
      const { setApiBaseUrl } = require('@/utils/sqliteDatabase');
      setApiBaseUrl(url);
    },
    getPosts: () => {
      console.log('📋 Current posts in memory:', posts.length);
      return posts;
    },
    clearAllPosts,
    exportPostsData,
    getStorageSize: async () => {
      try {
        await sqliteDB.initialize();
        const stats = await sqliteDB.getStats();
        console.log('💾 PostgreSQL DB size:', stats.size);
        console.log('📊 Posts in database:', stats.posts);
        return stats.size;
      } catch (error) {
        console.error('❌ Error getting SQLite DB size:', error);
        return '0KB';
      }
    },
    inspectStorage: async () => {
      try {
        await sqliteDB.initialize();
        const posts = await sqliteDB.getAllPosts();
        const users = await sqliteDB.getAllUsers();
        const stats = await sqliteDB.getStats();

        console.log('🔍 PostgreSQL DB inspection:');
        console.log('- Posts count:', posts.length);
        console.log('- Users count:', users.length);
        console.log('- Comments count:', stats.comments);
        console.log('- Database size:', stats.size);

        console.log('\n👥 Users in database:');
        users.forEach(user => {
          console.log(`  - ${user.name} (${user.handle}) - ${user.followers} followers`);
        });

        return {
          posts,
          users,
          stats,
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.error('❌ Error inspecting SQLite DB:', error);
        return null;
      }
    },
    showUsers: async () => {
      try {
        await sqliteDB.initialize();
        const users = await sqliteDB.getAllUsers();

        console.log('👥 Database Users:');
        console.log('================');
        if (users.length === 0) {
          console.log('No users found in database');
          return [];
        }

        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name}`);
          console.log(`   Handle: ${user.handle}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Followers: ${user.followers}`);
          console.log(`   Following: ${user.following}`);
          console.log(`   Verified: ${user.verified ? '✅' : '❌'}`);
          if (user.bio) console.log(`   Bio: ${user.bio}`);
          console.log('');
        });

        return users;
      } catch (error) {
        console.error('❌ Error showing users:', error);
        return [];
      }
    },
    forceRefresh: () => {
      console.log('🔄 Force refreshing posts from localStorage...');
      window.location.reload();
    },
    simulateMultiUser: () => {
      console.log('👥 Simulating multi-user scenario...');

      // Simulate User 1 posting
      const user1Post: ModeratedPost = {
        id: 'sim_user1_' + Date.now(),
        author: { id: '1', name: 'Sarah Chen', handle: '@sarahchen', avatar: 'test1', followers: 0, following: 0 },
        content: 'Post from User 1 in multi-user test',
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        reposts: 0,
        isLiked: false,
        cyberbullyingResult: { isCyberbullying: false, severity: 'low', categories: [], confidence: 0.1 },
        moderationAction: 'none',
        isHidden: false,
        isBully: false,
        isReported: false
      };

      // Simulate User 2 posting
      const user2Post: ModeratedPost = {
        id: 'sim_user2_' + Date.now(),
        author: { id: '2', name: 'Alex Rivera', handle: '@alexrivera', avatar: 'test2', followers: 0, following: 0 },
        content: 'Post from User 2 in multi-user test',
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        reposts: 0,
        isLiked: false,
        cyberbullyingResult: { isCyberbullying: false, severity: 'low', categories: [], confidence: 0.1 },
        moderationAction: 'none',
        isHidden: false,
        isBully: false,
        isReported: false
      };

      const currentPosts = posts;
      setPosts([user1Post, user2Post, ...currentPosts]);
      console.log('✅ Added test posts from both users');
    },
    testPersistence: () => {
      console.log('🧪 Testing real-time DB persistence...');
      const testPost: ModeratedPost = {
        id: 'test_' + Date.now(),
        author: { id: 'test', name: 'Test User', handle: '@test', avatar: 'test', followers: 0, following: 0 },
        content: 'Test post for real-time DB persistence',
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        reposts: 0,
        isLiked: false,
        cyberbullyingResult: {
          isCyberbullying: false,
          severity: 'low',
          categories: [],
          confidence: 0.1
        },
        moderationAction: 'none',
        isHidden: false,
        isBully: false,
        isReported: false
      };

      // Save test post
      const currentPosts = posts;
      setPosts([testPost, ...currentPosts]);

      // Check if it was saved to PostgreSQL DB
      setTimeout(async () => {
        try {
          await sqliteDB.initialize();
          const allPosts = await sqliteDB.getAllPosts();
          const found = allPosts.find((p: any) => p.id === testPost.id);
          if (found) {
            console.log('✅ SQLite DB persistence test PASSED');
          } else {
            console.log('❌ SQLite DB persistence test FAILED - post not found');
          }
        } catch (error) {
          console.log('❌ SQLite DB persistence test FAILED - error:', error);
        }
      }, 100);
    },
    monitorRealTime: async () => {
      console.log('📡 Monitoring SQLite DB updates for 30 seconds...');

      let lastPostCount = posts.length;

      const checkInterval = setInterval(async () => {
        try {
          await sqliteDB.initialize();
          const currentPosts = await sqliteDB.getAllPosts();

          if (currentPosts.length !== lastPostCount) {
            console.log('📡 DB update detected:', currentPosts.length, 'posts');
            console.log('📋 Posts in DB:', currentPosts.map(p => `${p.author_name}: ${p.content.substring(0, 30)}...`));
            lastPostCount = currentPosts.length;
          }
        } catch (error) {
          console.error('❌ Error monitoring DB updates:', error);
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('⏹️ Stopped monitoring SQLite DB updates');
      }, 30000);
    },
    forceSyncFromDB: async () => {
      console.log('🔄 Force syncing posts from database...');
      try {
        await sqliteDB.initialize();
        const dbPosts = await sqliteDB.getAllPosts();
        console.log('📥 Found', dbPosts.length, 'posts in database');

        if (dbPosts.length > 0) {
          console.log('📋 Database posts:');
          dbPosts.forEach((post, index) => {
            console.log(`  ${index + 1}. ${post.author_name}: ${post.content?.substring(0, 50)}...`);
          });

          // Transform posts from MongoDB API: map '_id' to 'id' and other field mappings
          const transformedPosts = dbPosts.map((post, index) => {
            const newId = post.id || post._id?.toString();
            console.log(`🔄 Transforming post ${index} in loadPosts: original id=${post.id}, _id=${post._id}, newId=${newId}, categories=${JSON.stringify(post.categories)}, cyberbullying_categories=${JSON.stringify(post.cyberbullying_categories)}`);
            return {
              ...post,
              id: newId, // Use id if present (Mongoose getter), else _id.toString()
              reposts: post.shares || post.reposts || 0, // Map shares to reposts
              image: post.media_urls || post.image, // Map media_urls to image
              is_cyberbullying: post.cyberbullying_detected || post.is_cyberbullying,
              severity: post.cyberbullying_severity || post.severity,
              categories: post.cyberbullying_categories || post.categories,
            };
          });

          const processedPosts: ModeratedPost[] = transformedPosts.map((dbPost): ModeratedPost => {
            // Create a basic ModeratedPost from the database
            return {
              id: dbPost.id,
              author: {
                id: dbPost.author_id,
                name: dbPost.author_name || 'Unknown',
                handle: dbPost.author_handle || '@unknown',
                email: dbPost.author_email || '',
                avatar: dbPost.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbPost.author_id}`,
                followers: 0,
                following: 0
              },
              content: dbPost.content,
              image: dbPost.image,
              timestamp: new Date(dbPost.timestamp),
              likes: dbPost.likes,
              comments: dbPost.comments,
              reposts: dbPost.reposts,
              isLiked: false,
              cyberbullyingResult: {
                isCyberbullying: dbPost.is_cyberbullying || false,
                severity: (dbPost.severity as 'low' | 'medium' | 'high') || 'low',
                categories: (() => {
                  if (Array.isArray(dbPost.categories)) return dbPost.categories;
                  if (typeof dbPost.categories === 'string') {
                    try { return JSON.parse(dbPost.categories); } catch { return []; }
                  }
                  return [];
                })(),
                confidence: 0.8
              },
              moderationAction: (dbPost.moderation_action as 'hide' | 'flag' | 'none') || 'none',
              isHidden: dbPost.is_hidden || false, // Use stored value from database
              isBully: dbPost.is_bully ?? dbPost.cyberbullying_detected ?? false,
              isReported: dbPost.is_reported || false,
              isAutoDeleted: dbPost.is_bully ?? dbPost.is_cyberbullying ?? false
            };
          });

          // Don't re-process through moderation service - use stored results from database
          // This prevents previously-OK posts from being incorrectly flagged as bully
          
          // Filter out bully posts and hidden posts from UI
          const visiblePosts = processedPosts.filter(post => {
            if (post.isBully || post.isHidden) {
              return false;
            }
            return true;
          });
          
          setPosts(visiblePosts);
          console.log('✅ Force sync completed - posts loaded from database:', visiblePosts.length, 'out of', processedPosts.length);
          return visiblePosts;
        } else {
          console.log('📋 No posts in database to sync');
          return [];
        }
      } catch (error) {
        console.error('❌ Error during force sync:', error);
        return [];
      }
    },
    migrateLocalStorageToSQLite: async () => {
      console.log('🔄 Manual migration from localStorage to SQLite...');
      try {
        const localStorageData = localStorage.getItem('chirp_posts');
        if (!localStorageData) {
          console.log('📭 No localStorage data to migrate');
          return 0;
        }

        console.log('📦 Parsing localStorage data...');
        const parsed = JSON.parse(localStorageData);
        const posts = parsed.posts || parsed;
        console.log('📋 localStorage posts to migrate:', posts.length);

        if (posts.length > 0) {
          console.log('🗄️ Initializing SQLite database for migration...');
          await sqliteDB.initialize();

          console.log('🧹 Clearing existing posts in database...');
          await sqliteDB.clearAllPosts();

          console.log('🚀 Starting post migration...');
          // Migrate each post
          let successCount = 0;
          for (const [index, post] of posts.entries()) {
            try {
              console.log(`📝 Migrating post ${index + 1}/${posts.length}: ${post.content?.substring(0, 30)}... by ${post.author?.name}`);

              await sqliteDB.insertPost({
                id: post.id || `migrated_${Date.now()}_${index}`,
                author_id: post.author?.id || 'unknown',
                author_name: post.author?.name || 'Unknown',
                author_handle: post.author?.handle || '@unknown',
                author_avatar: post.author?.avatar || 'default_avatar',
                author_email: post.author?.email || '',
                content: post.content || '',
                image: post.image,
                timestamp: post.timestamp || new Date().toISOString(),
                likes: post.likes || 0,
                comments: post.comments || 0,
                reposts: post.reposts || 0,
                is_cyberbullying: post.cyberbullyingResult?.isCyberbullying || false,
                severity: post.cyberbullyingResult?.severity || 'low',
                categories: JSON.stringify(post.cyberbullyingResult?.categories || []),
                moderation_action: post.moderationAction || 'none',
                is_hidden: post.isHidden || false,
                is_bully: post.isBully || false,
                is_reported: post.isReported || false
              });
              successCount++;
              console.log(`✅ Post ${index + 1} migrated successfully`);
            } catch (error) {
              console.error(`❌ Error migrating post ${index}:`, error);
            }
          }

          console.log(`✅ Migration completed: ${successCount}/${posts.length} posts migrated`);

          // Verify migration
          const verifyPosts = await sqliteDB.getAllPosts();
          console.log(`✅ Verification: ${verifyPosts.length} posts in PostgreSQL database`);

          if (verifyPosts.length > 0) {
            console.log('📋 Migrated posts in database:');
            verifyPosts.forEach((post, index) => {
              console.log(`  ${index + 1}. ${post.author_name}: ${post.content?.substring(0, 50)}...`);
            });
          }

          return successCount;
        } else {
          console.log('📋 No posts to migrate');
          return 0;
        }
      } catch (error) {
        console.error('❌ Error during manual migration:', error);
        return 0;
      }
    },
    testSQLiteDatabase: async () => {
      console.log('🧪 Testing database functionality...');
      try {
        console.log('1️⃣ Initializing database...');
        await sqliteDB.initialize();

    console.log('💾 Database mode:', sqliteDB.isUsingLocalStorage() ? 'localStorage' : 'MongoDB');

        console.log('2️⃣ Testing post insertion...');
        const testPost = {
          id: `test_${Date.now()}`,
          author_id: 'test_user',
          author_name: 'Test User',
          author_handle: '@testuser',
          author_avatar: 'test_avatar',
          author_email: 'test@example.com',
          content: 'This is a test post for database',
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: 0,
          reposts: 0,
          is_cyberbullying: false,
          severity: 'low' as const,
          categories: '[]',
          moderation_action: 'none' as const,
          is_hidden: false,
          is_bully: false,
          is_reported: false
        };

        await sqliteDB.insertPost(testPost);
        console.log('✅ Test post inserted');

        console.log('3️⃣ Testing post retrieval...');
        const retrievedPosts = await sqliteDB.getAllPosts();
        console.log(`📋 Retrieved ${retrievedPosts.length} posts from database`);

        const foundTestPost = retrievedPosts.find(p => p.id === testPost.id);
        if (foundTestPost) {
          console.log('✅ Test post found in database');
          console.log('📝 Test post content:', foundTestPost.content);
        } else {
          console.log('❌ Test post NOT found in database');
        }

        console.log('4️⃣ Testing database stats...');
        const stats = await sqliteDB.getStats();
        console.log('📊 Database stats:', stats);

        console.log('5️⃣ Cleaning up test data...');
        if (!sqliteDB.isUsingLocalStorage()) {
          await sqliteDB.deletePost(testPost.id);
        }
        console.log('✅ Test completed and cleaned up');

        return true;
      } catch (error) {
        console.error('❌ Database test failed:', error);
        return false;
      }
    },
    forceReconnect: async () => {
      console.log('🔧 Attempting to reconnect to MongoDB...');
      try {
        await sqliteDB.forceReconnect();
        console.log('✅ Reconnected to MongoDB');
      } catch (error) {
        console.error('❌ Failed to reconnect to MongoDB:', error);
      }
    },
    checkDatabaseMode: () => {
      const mode = sqliteDB.isUsingLocalStorage() ? 'localStorage' : 'MongoDB';
      console.log('💾 Current database mode:', mode);
      return mode;
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
        editPost,
        toggleLike,
        toggleRepost,
        toggleFollow,
        addComment,
        markNotificationAsRead,
        searchUsers,
        searchPosts,
        clearAllPosts,
        exportPostsData,
        addUser,
        getAllUsers,
        revealPostContent,
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
