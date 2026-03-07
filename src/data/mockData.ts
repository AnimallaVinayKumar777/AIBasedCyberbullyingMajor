export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  email?: string;
  bio?: string;
  coverImage?: string;
  followers: number;
  following: number;
  verified?: boolean;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
}

import { postModerationService, ModeratedPost } from '@/utils/postModeration';

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  reposts: number;
  isLiked?: boolean;
  commentList?: Comment[];
  isHidden?: boolean;
  isBully?: boolean;
  isReported?: boolean;
}

// Process posts through moderation service
const processPostsForModeration = async (posts: Post[]): Promise<ModeratedPost[]> => {
  return await postModerationService.processPosts(posts);
};

export interface Notification {
  id: string;
  type: 'like' | 'repost' | 'follow' | 'comment';
  user: User;
  post?: Post;
  timestamp: Date;
  read: boolean;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    handle: '@sarahchen',
    email: 'sarahchen@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'Software engineer by day, digital artist by night. Building cool stuff with React and TypeScript.',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
    followers: 1243,
    following: 532,
    verified: true,
  },
  {
    id: '2',
    name: 'Alex Rivera',
    handle: '@alexrivera',
    email: 'alexrivera@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'Tech enthusiast | Coffee lover ☕ | Sharing thoughts on web development',
    followers: 856,
    following: 423,
  },
  {
    id: '3',
    name: 'Maya Patel',
    handle: '@mayapatel',
    email: 'mayapatel@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
    bio: 'UX Designer passionate about creating delightful user experiences',
    followers: 2103,
    following: 678,
    verified: true,
  },
  {
    id: '4',
    name: 'Jordan Lee',
    handle: '@jordanlee',
    email: 'jordanlee@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    bio: 'Product Manager | Tech trends | AI enthusiast 🤖',
    followers: 543,
    following: 289,
  },
  {
    id: '5',
    name: 'Sam Taylor',
    handle: '@samtaylor',
    email: 'samtaylor@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    bio: 'Full-stack developer | Open source contributor',
    followers: 1876,
    following: 945,
  },
];

// Raw posts data (before moderation processing)
const rawMockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    content: 'Just shipped a new feature using React Server Components! The performance improvements are incredible. Anyone else experimenting with RSC?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 124,
    comments: 18,
    reposts: 23,
    commentList: [
      {
        id: 'c1',
        author: mockUsers[1],
        content: 'This is amazing! Can you share more details about your implementation?',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
      },
      {
        id: 'c2',
        author: mockUsers[2],
        content: 'Love RSC! The DX is incredible once you get used to it.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
      },
    ],
  },
  {
    id: '2',
    author: mockUsers[1],
    content: 'Hot take: TypeScript makes you a better JavaScript developer even when you\'re not using it. The mental model it builds is invaluable.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 342,
    comments: 67,
    reposts: 89,
  },
  {
    id: '3',
    author: mockUsers[2],
    content: 'Design tip of the day: White space is not wasted space. It\'s one of the most powerful tools in your design toolkit. Embrace it! ✨',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    likes: 891,
    comments: 42,
    reposts: 156,
  },
  {
    id: '4',
    author: mockUsers[3],
    content: 'The future of AI is not about replacing humans, but augmenting our capabilities. Excited to see where this goes!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    likes: 456,
    comments: 89,
    reposts: 123,
  },
  {
    id: '5',
    author: mockUsers[4],
    content: 'Contributing to open source has taught me more than any course ever could. If you\'re learning to code, find a project you love and start contributing!',
    image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=600&fit=crop',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    likes: 678,
    comments: 34,
    reposts: 98,
  },
  {
    id: '6',
    author: mockUsers[0],
    content: 'CSS Grid + Flexbox = Perfect layout duo. Stop fighting them, embrace both! 💪',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    likes: 234,
    comments: 21,
    reposts: 45,
  },
  {
    id: '7',
    author: mockUsers[2],
    content: 'Remember: Perfect is the enemy of good. Ship it, learn from it, iterate. That\'s how great products are built.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
    likes: 1203,
    comments: 78,
    reposts: 234,
  },
  {
    id: '8',
    author: mockUsers[3],
    content: 'So disappointed you are a libtard!, You are a pussy!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
    likes: 0,
    comments: 2,
    reposts: 0,
    isBully: true,
  },
  {
    id: '9',
    author: mockUsers[4],
    content: 'And why do you care what I say???, Lol looks like you have a crush you creepy Fag.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22),
    likes: 0,
    comments: 1,
    reposts: 0,
    isBully: true,
  },
  {
    id: '10',
    author: mockUsers[1],
    content: 'This is inappropriate content that violates our community guidelines.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    likes: 5,
    comments: 8,
    reposts: 2,
    isReported: true,
  },
  {
    id: '11',
    author: mockUsers[0],
    content: 'stupid',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    likes: 0,
    comments: 0,
    reposts: 0,
    isBully: true,
  },
  {
    id: '12',
    author: mockUsers[3],
    content: 'I will kill you, you pathetic libtard! Die now!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 0,
    comments: 0,
    reposts: 0,
    isHidden: true,
    isBully: true,
  },
  {
    id: '13',
    author: mockUsers[1],
    content: 'bad',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    likes: 0,
    comments: 0,
    reposts: 0,
    isBully: true,
  },
];

// Process posts through moderation service - not processing at module load
const mockPosts: ModeratedPost[] = rawMockPosts as ModeratedPost[];

export { mockPosts };

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: mockUsers[1],
    post: rawMockPosts[0],
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
  },
  {
    id: '2',
    type: 'follow',
    user: mockUsers[3],
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: false,
  },
  {
    id: '3',
    type: 'repost',
    user: mockUsers[2],
    post: rawMockPosts[5],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    read: true,
  },
  {
    id: '4',
    type: 'comment',
    user: mockUsers[4],
    post: rawMockPosts[0],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
  },
];

export const trendingTopics = [
  { tag: '#WebDev', posts: '45.2K' },
  { tag: '#ReactJS', posts: '38.7K' },
  { tag: '#TypeScript', posts: '29.4K' },
  { tag: '#AI', posts: '156.8K' },
  { tag: '#Design', posts: '67.3K' },
  {tag:'#affu',posts:'786k'}
];
