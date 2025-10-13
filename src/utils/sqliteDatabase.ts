// PostgreSQL Database Service for ChirpGuard
// This replaces SQLite for true cross-browser functionality

export interface DatabasePost {
  id: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_avatar: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  isLiked?: boolean;
  // Moderation fields
  is_cyberbullying?: boolean;
  severity?: string;
  categories?: string;
  moderation_action?: string;
  is_hidden?: boolean;
  is_bully?: boolean;
  is_reported?: boolean;
}

export interface DatabaseUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  verified: boolean;
}

// API Configuration - Update this with your PostgreSQL server URL
let API_BASE_URL = (import.meta.env?.VITE_API_URL as string) ||
                   ((globalThis as any).process?.env?.REACT_APP_API_URL as string) ||
                   'http://localhost:3001/api';

// Function to configure API URL at runtime
export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
  console.log('🔧 API Base URL updated to:', API_BASE_URL);
};

class PostgreSQLDatabaseService {
  private initialized = false;
  private useLocalStorage = false; // Fallback flag

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🗄️ PostgreSQL database already initialized');
      return;
    }

    try {
      console.log('🗄️ Initializing PostgreSQL database connection...');

      // Test connection to the API
      await this.testConnection();
      this.useLocalStorage = false;
      this.initialized = true;

      console.log('🎉 PostgreSQL database connection established!');

      // Get initial stats
      const stats = await this.getStats();
      console.log('📊 Database initialized with stats:', stats);
    } catch (error) {
      console.warn('⚠️ PostgreSQL backend not available, falling back to localStorage mode');
      this.useLocalStorage = true;
      this.initialized = true;

      // Initialize localStorage fallback
      this.initializeLocalStorage();

      console.log('💾 localStorage fallback mode activated');
      console.log('📝 Posts will be saved locally until PostgreSQL backend is available');
    }
  }

  private initializeLocalStorage(): void {
    // Initialize localStorage structure if it doesn't exist
    if (!localStorage.getItem('chirp_posts')) {
      localStorage.setItem('chirp_posts', JSON.stringify({ posts: [], users: [] }));
    }
    if (!localStorage.getItem('chirp_users')) {
      localStorage.setItem('chirp_users', JSON.stringify([]));
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ PostgreSQL API connection test passed:', data);
    } catch (error) {
      console.warn('⚠️ PostgreSQL API connection test failed:', error.message);
      console.log('🔄 Falling back to localStorage mode for development');
      throw error; // Still throw to trigger fallback mechanism
    }
  }

  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Insert a new post
  async insertPost(post: Omit<DatabasePost, 'id'> & { id?: string }): Promise<void> {
    if (this.useLocalStorage) {
      return this.insertPostLocal(post);
    }

    try {
      await this.apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify(post),
      });
      console.log('💾 Post inserted into PostgreSQL database');
    } catch (error) {
      console.error('❌ Error inserting post:', error);
      // Fallback to localStorage if PostgreSQL fails
      console.log('🔄 Falling back to localStorage for post insertion');
      return this.insertPostLocal(post);
    }
  }

  private insertPostLocal(post: Omit<DatabasePost, 'id'> & { id?: string }): void {
    try {
      const existingData = JSON.parse(localStorage.getItem('chirp_posts') || '{ "posts": [] }');
      const posts = existingData.posts || [];

      const newPost = {
        ...post,
        id: post.id || `post_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      posts.unshift(newPost); // Add to beginning

      localStorage.setItem('chirp_posts', JSON.stringify({ posts }));
      console.log('💾 Post saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving post to localStorage:', error);
      throw error;
    }
  }

  // Get all posts
  async getAllPosts(): Promise<DatabasePost[]> {
    if (this.useLocalStorage) {
      return this.getAllPostsLocal();
    }

    try {
      const posts = await this.apiRequest('/posts');
      console.log(`📋 Retrieved ${posts.length} posts from PostgreSQL`);
      return posts;
    } catch (error) {
      console.error('❌ Error retrieving posts:', error);
      // Fallback to localStorage if PostgreSQL fails
      console.log('🔄 Falling back to localStorage for post retrieval');
      return this.getAllPostsLocal();
    }
  }

  private getAllPostsLocal(): DatabasePost[] {
    try {
      const data = JSON.parse(localStorage.getItem('chirp_posts') || '{ "posts": [] }');
      const posts = data.posts || [];
      console.log(`📚 Retrieved ${posts.length} posts from localStorage`);
      return posts;
    } catch (error) {
      console.error('❌ Error retrieving posts from localStorage:', error);
      return [];
    }
  }

  // Get all users
  async getAllUsers(): Promise<DatabaseUser[]> {
    if (this.useLocalStorage) {
      return this.getAllUsersLocal();
    }

    try {
      const users = await this.apiRequest('/users');
      console.log(`👥 Retrieved ${users.length} users from PostgreSQL`);
      return users;
    } catch (error) {
      console.error('❌ Error retrieving users:', error);
      // Fallback to localStorage if PostgreSQL fails
      console.log('🔄 Falling back to localStorage for user retrieval');
      return this.getAllUsersLocal();
    }
  }

  private getAllUsersLocal(): DatabaseUser[] {
    try {
      const users = JSON.parse(localStorage.getItem('chirp_users') || '[]');
      console.log(`👥 Retrieved ${users.length} users from localStorage`);
      return users;
    } catch (error) {
      console.error('❌ Error retrieving users from localStorage:', error);
      return [];
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<DatabaseUser | null> {
    try {
      const user = await this.apiRequest(`/users/${userId}`);
      return user;
    } catch (error) {
      console.error('❌ Error retrieving user:', error);
      return null;
    }
  }

  // Insert or update user
  async insertUser(user: DatabaseUser): Promise<void> {
    if (this.useLocalStorage) {
      return this.insertUserLocal(user);
    }

    try {
      await this.apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
      console.log('💾 User inserted into PostgreSQL database:', user.name);
    } catch (error) {
      console.error('❌ Error inserting user:', error);
      // Fallback to localStorage if PostgreSQL fails
      console.log('🔄 Falling back to localStorage for user insertion');
      return this.insertUserLocal(user);
    }
  }

  private insertUserLocal(user: DatabaseUser): void {
    try {
      const users = JSON.parse(localStorage.getItem('chirp_users') || '[]');

      // Check if user already exists, update if so
      const existingIndex = users.findIndex((u: DatabaseUser) => u.id === user.id);
      if (existingIndex >= 0) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }

      localStorage.setItem('chirp_users', JSON.stringify(users));
      console.log('💾 User saved to localStorage:', user.name);
    } catch (error) {
      console.error('❌ Error saving user to localStorage:', error);
      throw error;
    }
  }

  // Get posts by author
  async getPostsByAuthor(authorId: string): Promise<DatabasePost[]> {
    try {
      const posts = await this.apiRequest(`/posts/author/${authorId}`);
      return posts;
    } catch (error) {
      console.error('❌ Error retrieving posts by author:', error);
      return [];
    }
  }

  // Update post likes
  async updatePostLikes(postId: string, likes: number): Promise<void> {
    try {
      await this.apiRequest(`/posts/${postId}/likes`, {
        method: 'PUT',
        body: JSON.stringify({ likes }),
      });
      console.log('💖 Post likes updated');
    } catch (error) {
      console.error('❌ Error updating post likes:', error);
      throw error;
    }
  }

  // Update post hidden status
  async updatePostHiddenStatus(postId: string, isHidden: boolean): Promise<void> {
    try {
      await this.apiRequest(`/posts/${postId}/hidden`, {
        method: 'PUT',
        body: JSON.stringify({ is_hidden: isHidden }),
      });
      console.log(`🔄 Post ${postId} hidden status updated to: ${isHidden}`);
    } catch (error) {
      console.error('❌ Error updating post hidden status:', error);
      throw error;
    }
  }

  // Delete post
  async deletePost(postId: string): Promise<void> {
    try {
      await this.apiRequest(`/posts/${postId}`, {
        method: 'DELETE',
      });
      console.log('🗑️ Post deleted from PostgreSQL database');
    } catch (error) {
      console.error('❌ Error deleting post:', error);
      throw error;
    }
  }

  // Clear all posts
  async clearAllPosts(): Promise<void> {
    try {
      await this.apiRequest('/posts', {
        method: 'DELETE',
      });
      console.log('🗑️ All posts cleared from PostgreSQL database');
    } catch (error) {
      console.error('❌ Error clearing posts:', error);
      throw error;
    }
  }

  // Get database statistics
  async getStats(): Promise<{ posts: number; users: number; comments: number; size: string }> {
    if (this.useLocalStorage) {
      return this.getStatsLocal();
    }

    try {
      const stats = await this.apiRequest('/stats');
      return stats;
    } catch (error) {
      console.error('❌ Error retrieving database stats:', error);
      // Fallback to localStorage stats if PostgreSQL fails
      console.log('🔄 Falling back to localStorage for stats');
      return this.getStatsLocal();
    }
  }

  private getStatsLocal(): { posts: number; users: number; comments: number; size: string } {
    try {
      const postsData = JSON.parse(localStorage.getItem('chirp_posts') || '{ "posts": [] }');
      const usersData = JSON.parse(localStorage.getItem('chirp_users') || '[]');

      const posts = postsData.posts || [];
      const users = usersData || [];

      // Calculate approximate size
      const sizeInBytes = JSON.stringify({ posts, users }).length;
      const sizeInKB = Math.round(sizeInBytes / 1024);

      return {
        posts: posts.length,
        users: users.length,
        comments: 0, // Not tracked in localStorage
        size: `${sizeInKB}KB`
      };
    } catch (error) {
      console.error('❌ Error calculating localStorage stats:', error);
      return { posts: 0, users: 0, comments: 0, size: '0KB' };
    }
  }

  // Export database (returns JSON for now)
  async exportDatabase(): Promise<string> {
    if (this.useLocalStorage) {
      return this.exportDatabaseLocal();
    }

    try {
      const data = await this.apiRequest('/export');
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('❌ Error exporting database:', error);
      // Fallback to localStorage export if PostgreSQL fails
      console.log('🔄 Falling back to localStorage for database export');
      return this.exportDatabaseLocal();
    }
  }

  private exportDatabaseLocal(): string {
    try {
      const postsData = JSON.parse(localStorage.getItem('chirp_posts') || '{ "posts": [] }');
      const usersData = JSON.parse(localStorage.getItem('chirp_users') || '[]');

      const exportData = {
        posts: postsData.posts || [],
        users: usersData || [],
        exported_at: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Error exporting localStorage database:', error);
      throw error;
    }
  }

  // Import database from JSON
  async importDatabase(jsonData: string): Promise<void> {
    if (this.useLocalStorage) {
      return this.importDatabaseLocal(jsonData);
    }

    try {
      const data = JSON.parse(jsonData);
      await this.apiRequest('/import', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('📥 Database imported successfully');
    } catch (error) {
      console.error('❌ Error importing database:', error);
      // Fallback to localStorage import if PostgreSQL fails
      console.log('🔄 Falling back to localStorage for database import');
      return this.importDatabaseLocal(jsonData);
    }
  }

  private importDatabaseLocal(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      if (data.posts) {
        localStorage.setItem('chirp_posts', JSON.stringify({ posts: data.posts }));
      }

      if (data.users) {
        localStorage.setItem('chirp_users', JSON.stringify(data.users));
      }

      console.log('📥 Database imported to localStorage successfully');
    } catch (error) {
      console.error('❌ Error importing database to localStorage:', error);
      throw error;
    }
  }

  // Close database connection
  close(): void {
    this.initialized = false;
    console.log('🔌 PostgreSQL database connection closed');
  }

  // Check if using localStorage fallback mode
  isUsingLocalStorage(): boolean {
    return this.useLocalStorage;
  }

  // Force switch to localStorage mode for testing
  forceLocalStorageMode(): void {
    this.useLocalStorage = true;
    console.log('🔧 Forced localStorage mode for testing');
  }

  // Force switch to PostgreSQL mode (will test connection)
  async forcePostgreSQLMode(): Promise<void> {
    this.useLocalStorage = false;
    this.initialized = false;
    console.log('🔧 Attempting to switch to PostgreSQL mode');
    await this.initialize();
  }
}

// Create global database instance
export const sqliteDB = new PostgreSQLDatabaseService();

// Initialize database when module loads
sqliteDB.initialize().catch(console.error);