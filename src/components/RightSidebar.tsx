import { Search, TrendingUp, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trendingTopics } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { toast } from '@/hooks/use-toast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const RightSidebar = () => {
  const { t } = useTranslation();
  const { users, currentUser, toggleFollow, followedUsers } = useApp();
  const suggestedUsers = users.filter(u => u.id !== currentUser.id).slice(0, 3);

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
    <aside className="sticky top-0 h-screen w-80 p-4 hidden xl:block overflow-y-auto">
      <div className="mb-4">
        <LanguageSwitcher />
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder={t('common.search')}
          className="pl-12 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>

      <Card className="mb-4 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            {t('sidebar.trending')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.tag}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <p className="text-sm text-muted-foreground">Trending</p>
              <p className="font-semibold text-foreground">{topic.tag}</p>
              <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5" />
            {t('sidebar.who_to_follow')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {suggestedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.handle}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={followedUsers.has(user.id) ? "outline" : "default"}
                className="rounded-full flex-shrink-0"
                onClick={() => handleFollowToggle(user.id, user.name)}
              >
                {followedUsers.has(user.id) ? t('common.following') : t('common.follow')}
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
};
