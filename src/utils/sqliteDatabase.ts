// MongoDB Database Service for SafeNet
// Uses MongoDB API for all data storage

export interface DatabasePost {
  id?: string;
  _id?: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_avatar: string;
  author_email: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  shares?: number;
  media_urls?: string;
  isLiked?: boolean;
  // Moderation fields
  is_cyberbullying?: boolean;
  cyberbullying_detected?: boolean;
  severity?: string;
  cyberbullying_severity?: string;
  categories?: string;
  cyberbullying_categories?: string;
  moderation_action?: string;
  moderation_status?: string;
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

// API Configuration - MongoDB server URL
let API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 
                   ((globalThis as any).process?.env?.REACT_APP_API_URL as string) ||
                   'http://localhost:5000/api';

// Function to configure API URL at runtime
export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
  console.log('🔧 API Base URL updated to:', API_BASE_URL);
};

class MongoDBDatabaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🗄️ MongoDB database already initialized');
      return;
    }

    try {
      console.log('🗄️ Initializing MongoDB database connection...');

      // Test connection to the API
      await this.testConnection();
      this.initialized = true;

      console.log('🎉 MongoDB database connection established!');

      // Get initial stats
      const stats = await this.getStats();
      console.log('📊 Database initialized with stats:', stats);
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      // Fall back to empty state - show UI but data won't persist
      this.initialized = true;
      console.log('📝 App will run without database persistence');
    }
  }

  private async testConnection(): Promise<void> {
    console.log('🔍 Testing API connection to:', `${API_BASE_URL}/health`);
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
    console.log('✅ MongoDB API connection test passed:', data);
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
    console.log('🌐 Inserting post to MongoDB API...');
    await this.apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
    console.log('💾 Post inserted into MongoDB database');
  }

  // Get all posts
  async getAllPosts(): Promise<DatabasePost[]> {
    console.log('🌐 Fetching posts from MongoDB API...');
    const posts = await this.apiRequest('/posts');
    console.log(`📋 Retrieved ${posts.length} posts from MongoDB API`);
    return posts;
  }

  // Get all users
  async getAllUsers(): Promise<DatabaseUser[]> {
    const users = await this.apiRequest('/users');
    console.log(`👥 Retrieved ${users.length} users from MongoDB`);
    return users;
  }

  // Get user by ID
  async getUserById(userId: string): Promise<DatabaseUser | null> {
    const user = await this.apiRequest(`/users/${userId}`);
    return user;
  }

  // Insert or update user
  async insertUser(user: DatabaseUser): Promise<void> {
    await this.apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    console.log('💾 User inserted into MongoDB database:', user.name);
  }

  // Get posts by author
  async getPostsByAuthor(authorId: string): Promise<DatabasePost[]> {
    const posts = await this.apiRequest(`/posts/author/${authorId}`);
    return posts;
  }

  // Update post likes
  async updatePostLikes(postId: string, likes: number): Promise<void> {
    await this.apiRequest(`/posts/${postId}/likes`, {
      method: 'PUT',
      body: JSON.stringify({ likes }),
    });
    console.log('💖 Post likes updated');
  }

  // Update post hidden status
  async updatePostHiddenStatus(postId: string, isHidden: boolean): Promise<void> {
    await this.apiRequest(`/posts/${postId}/hidden`, {
      method: 'PUT',
      body: JSON.stringify({ is_hidden: isHidden }),
    });
    console.log(`🔄 Post ${postId} hidden status updated to: ${isHidden}`);
  }

  // Update entire post
  async updatePost(post: DatabasePost): Promise<void> {
    await this.apiRequest(`/posts/${post.id}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    });
    console.log('💾 Post updated in MongoDB database');
  }

  // Delete post
  async deletePost(postId: string): Promise<void> {
    await this.apiRequest(`/posts/${postId}`, {
      method: 'DELETE',
    });
    console.log('🗑️ Post deleted from MongoDB database');
  }

  // Clear all posts
  async clearAllPosts(): Promise<void> {
    await this.apiRequest('/posts', {
      method: 'DELETE',
    });
    console.log('🗑️ All posts cleared from MongoDB database');
  }

  // Get database statistics
  async getStats(): Promise<{ posts: number; users: number; comments: number; size: string }> {
    const stats = await this.apiRequest('/stats');
    return stats;
  }

  // Export database (returns JSON for now)
  async exportDatabase(): Promise<string> {
    const data = await this.apiRequest('/export');
    return JSON.stringify(data, null, 2);
  }

  // Import database from JSON
  async importDatabase(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    await this.apiRequest('/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('📥 Database imported successfully');
  }

  // Close database connection
  close(): void {
    this.initialized = false;
    console.log('🔌 MongoDB database connection closed');
  }

  // Check if using localStorage (always false for MongoDB)
  isUsingLocalStorage(): boolean {
    return false;
  }

  // Force reconnect to MongoDB
  async forceReconnect(): Promise<void> {
    this.initialized = false;
    console.log('🔧 Attempting to reconnect to MongoDB');
    await this.initialize();
  }
}

// Create global database instance
export const sqliteDB = new MongoDBDatabaseService();