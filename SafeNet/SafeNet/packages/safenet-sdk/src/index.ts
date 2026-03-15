/**
 * SafeNet SDK - Cyberbullying Detection for JavaScript/TypeScript
 * 
 * Local SDK for SafeNet moderation and API access.
 * 
 * @packageDocumentation
 */

// Re-export types from cyberbullyingDetection
export type {
  CyberbullyingResult,
  DetectionConfig,
  CategoryWeights,
  LanguageConfig,
  SeverityLevel,
  DetectionCategory,
  ModerationAction
} from './cyberbullyingDetection';

// Re-export detector class
export { CyberbullyingDetector } from './cyberbullyingDetection';

// Re-export utility functions
export { detectCyberbullying, getPostModerationAction } from './cyberbullyingDetection';

/**
 * Moderation analysis result combining detection and action
 */
export interface ModerationAnalysis {
  result: CyberbullyingResult;
  action: 'hide' | 'flag' | 'none';
}

/**
 * Analyze text for cyberbullying and get moderation recommendation
 * 
 * @param text - The text content to analyze
 * @param config - Optional detection configuration
 * @returns Promise resolving to moderation analysis
 * 
 * @example
 * ```typescript
 * import { analyzeText } from '@safenet/sdk';
 * 
 * const analysis = await analyzeText('You are awful');
 * console.log(analysis.result.severity, analysis.action);
 * ```
 */
export async function analyzeText(
  text: string,
  config?: Partial<DetectionConfig>
): Promise<ModerationAnalysis> {
  const detector = new CyberbullyingDetector(config);
  const result = await detector.analyzeContent(text);
  return {
    result,
    action: detector.getModerationAction(result)
  };
}

/**
 * Options for creating a SafeNet client
 */
export interface SafeNetClientOptions {
  /** Base URL for the SafeNet API */
  baseUrl?: string;
  /** Custom headers for API requests */
  headers?: Record<string, string>;
  /** Custom fetch function */
  fetchFn?: typeof fetch;
}

/** Post input type */
export type PostInput = Record<string, unknown>;
/** User input type */
export type UserInput = Record<string, unknown>;

/**
 * SafeNet API Client
 * 
 * Provides methods for interacting with the SafeNet backend API.
 * 
 * @example
 * ```typescript
 * import { createSafeNetClient } from '@safenet/sdk';
 * 
 * const client = createSafeNetClient({ baseUrl: 'http://localhost:5000' });
 * const posts = await client.getPosts();
 * ```
 */
export class SafeNetClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private fetchFn: typeof fetch;

  constructor(options: SafeNetClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? 'http://localhost:5000';
    this.headers = {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    };
    this.fetchFn = options.fetchFn ?? fetch;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        ...this.headers,
        ...(init?.headers || {})
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed (${response.status})`);
    }

    return response.json() as Promise<T>;
  }

  /** Get all posts */
  getPosts<T = unknown[]>(): Promise<T> {
    return this.request('/api/posts');
  }

  /** Get a single post by ID */
  getPost<T = unknown>(id: string): Promise<T> {
    return this.request(`/api/posts/${id}`);
  }

  /** Create a new post */
  createPost<T = unknown>(post: PostInput): Promise<T> {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(post)
    });
  }

  /** Get all users */
  getUsers<T = unknown[]>(): Promise<T> {
    return this.request('/api/users');
  }

  /** Get a single user by ID */
  getUser<T = unknown>(id: string): Promise<T> {
    return this.request(`/api/users/${id}`);
  }

  /** Create a new user */
  createUser<T = unknown>(user: UserInput): Promise<T> {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  }
}

/**
 * Create a new SafeNet client instance
 * 
 * @param options - Client configuration options
 * @returns Configured SafeNetClient instance
 * 
 * @example
 * ```typescript
 * import { createSafeNetClient } from '@safenet/sdk';
 * 
 * const client = createSafeNetClient({
 *   baseUrl: 'https://api.safenet.example.com',
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 * ```
 */
export function createSafeNetClient(options?: SafeNetClientOptions): SafeNetClient {
  return new SafeNetClient(options);
}
