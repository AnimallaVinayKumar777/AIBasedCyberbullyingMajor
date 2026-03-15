import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/PostCard';
import { trendingTopics } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';

export default function Explore() {
  const { users, searchUsers, searchPosts, toggleFollow, followedUsers, currentUser, posts: allPosts } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: typeof users; posts: typeof allPosts }>({ users: [], posts: [] });
  
  const suggestedUsers = users.filter(u => u.id !== currentUser.id).slice(0, 4);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchResults({
        users: searchUsers(query),
        posts: searchPosts(query),
      });
    } else {
      setSearchResults({ users: [], posts: [] });
    }
  };

  const handleFollowToggle = (userId: string, userName: string) => {
    const isFollowing = followedUsers.has(userId);
    toggleFollow(userId);
    toast({
      title: isFollowing ? "Unfollowed" : "Following!",
      description: isFollowing 
        ? `You unfollowed ${userName}` 
        : `You are now following ${userName}`,
    });
  };

  return (
    <div>
      <div className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search Chirp"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="p-4">
        {searchQuery && (searchResults.users.length > 0 || searchResults.posts.length > 0) && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            {searchResults.users.length > 0 && (
              <Card className="mb-4 overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Users</h3>
                </div>
                <CardContent className="p-0">
                  {searchResults.users.map((user) => (
                    <div
                      key={user.id}
                      className="px-4 py-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{user.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.handle}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={followedUsers.has(user.id) ? "outline" : "default"}
                        className="rounded-full flex-shrink-0"
                        size="sm"
                        onClick={() => handleFollowToggle(user.id, user.name)}
                      >
                        {followedUsers.has(user.id) ? "Following" : "Follow"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {searchResults.posts.length > 0 && (
              <Card className="overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Posts</h3>
                </div>
                <div className="border-b border-border">
                  {searchResults.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {searchQuery && searchResults.users.length === 0 && searchResults.posts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground mb-6">
            No results found for "{searchQuery}"
          </div>
        )}

        {!searchQuery && (
          <>
            <Card className="mb-6 overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trending
                </h2>
              </div>
              <CardContent className="p-0">
                {trendingTopics.map((topic, index) => (
                  <motion.div
                    key={topic.tag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-4 py-4 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border last:border-0"
                  >
                    <p className="text-sm text-muted-foreground mb-1">Trending</p>
                    <p className="font-semibold text-foreground text-lg mb-1">
                      {topic.tag}
                    </p>
                    <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold">Suggested for you</h2>
              </div>
              <CardContent className="p-0">
                {suggestedUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-4 py-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.handle}
                        </p>
                        {user.bio && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={followedUsers.has(user.id) ? "outline" : "default"}
                      className="rounded-full flex-shrink-0"
                      size="sm"
                      onClick={() => handleFollowToggle(user.id, user.name)}
                    >
                      {followedUsers.has(user.id) ? "Following" : "Follow"}
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
