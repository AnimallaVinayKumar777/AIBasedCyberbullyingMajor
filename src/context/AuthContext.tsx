import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

export interface AuthUser extends User {
  email: string;
  isAuthenticated: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database (in a real app, this would be an API call)
interface UserCredential {
  id: string;
  name: string;
  handle: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  coverImage?: string;
  followers: number;
  following: number;
  verified: boolean;
}

const MOCK_USER_CREDENTIALS: UserCredential[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    handle: '@sarahchen',
    email: 'sarah@example.com',
    password: 'password123',
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
    email: 'alex@example.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'Tech enthusiast | Coffee lover ☕ | Sharing thoughts on web development',
    followers: 856,
    following: 423,
    verified: false,
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('chirp_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('chirp_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('chirp_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chirp_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user by email
    const foundUser = MOCK_USER_CREDENTIALS.find(u => u.email === email);

    if (foundUser && foundUser.password === password) {
      const authUser: AuthUser = {
        ...foundUser,
        isAuthenticated: true,
      };

      setUser(authUser);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${authUser.name}`,
      });
      setIsLoading(false);
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = MOCK_USER_CREDENTIALS.find(u => u.email === email);
    if (existingUser) {
      toast({
        title: "Signup failed",
        description: "User with this email already exists",
        variant: "destructive"
      });
      setIsLoading(false);
      return false;
    }

    // Create new user credentials
    const newUserCredentials: UserCredential = {
      id: Date.now().toString(),
      name,
      handle: `@${name.toLowerCase().replace(' ', '')}${Math.floor(Math.random() * 1000)}`,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      bio: '',
      followers: 0,
      following: 0,
      verified: false,
    };

    // Create authenticated user (without password)
    const newUser: AuthUser = {
      ...newUserCredentials,
      isAuthenticated: true,
    };

    // Add to mock database
    MOCK_USER_CREDENTIALS.push(newUserCredentials);

    setUser(newUser);
    toast({
      title: "Account created!",
      description: `Welcome to Chirp, ${newUser.name}!`,
    });
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Update in mock database (excluding password and isAuthenticated)
      const userIndex = MOCK_USER_CREDENTIALS.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        const { password, isAuthenticated, ...safeUpdates } = updates as any;
        MOCK_USER_CREDENTIALS[userIndex] = { ...MOCK_USER_CREDENTIALS[userIndex], ...safeUpdates };
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};