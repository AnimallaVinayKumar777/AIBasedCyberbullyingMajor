import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/PostCard';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const { posts, toggleFollow, followedUsers, likedPosts } = useApp();

  // Redirect to login if not authenticated
  if (!isAuthenticated || !authUser) {
    navigate('/login');
    return null;
  }

  const user = authUser;
  const userPosts = posts.filter((post) => post.author.id === user.id);
  const likedPostsList = posts.filter((post) => likedPosts.has(post.id));
  const isFollowing = followedUsers.has(user.id);

  const handleFollowToggle = () => {
    if (!user) return;

    toggleFollow(user.id);
    toast({
      title: isFollowing ? "Unfollowed" : "Following!",
      description: isFollowing
        ? `You unfollowed ${user.name}`
        : `You are now following ${user.name}`,
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div>
      <div className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-1">
              {user.name}
              {user.verified && (
                <BadgeCheck className="w-5 h-5 text-primary fill-primary" />
              )}
            </h1>
            <p className="text-sm text-muted-foreground">
              {userPosts.length} posts
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="px-4">
          <div className="flex items-end justify-between -mt-16 mb-4">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="rounded-full px-6"
            >
              Edit Profile
            </Button>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-1">
              {user.name}
              {user.verified && (
                <BadgeCheck className="w-5 h-5 text-primary fill-primary" />
              )}
            </h2>
            <p className="text-muted-foreground">{user.handle}</p>
          </div>

          {user.bio && (
            <p className="text-foreground mb-4">{user.bio}</p>
          )}

          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Joined March 2023</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <button className="hover:underline">
              <span className="font-semibold text-foreground">
                {formatNumber(user.following)}
              </span>
              <span className="text-muted-foreground ml-1">Following</span>
            </button>
            <button className="hover:underline">
              <span className="font-semibold text-foreground">
                {formatNumber(user.followers)}
              </span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger
            value="posts"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Replies
          </TabsTrigger>
          <TabsTrigger
            value="likes"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="m-0">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="replies" className="m-0 p-8 text-center text-muted-foreground">
          No replies yet
        </TabsContent>

        <TabsContent value="likes" className="m-0">
          {likedPostsList.length > 0 ? (
            likedPostsList.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No likes yet
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
