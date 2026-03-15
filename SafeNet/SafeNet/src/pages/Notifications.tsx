import { Heart, Repeat2, UserPlus, MessageCircle, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Notification } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const NotificationItem = ({ notification, index }: { notification: Notification; index: number }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />;
      case 'repost':
        return <Repeat2 className="w-6 h-6 text-green-500" />;
      case 'follow':
        return <UserPlus className="w-6 h-6 text-primary" />;
      case 'comment':
        return <MessageCircle className="w-6 h-6 text-primary" />;
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'repost':
        return 'reposted your post';
      case 'follow':
        return 'started following you';
      case 'comment':
        return 'commented on your post';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${Math.floor(diff / (1000 * 60))}m ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "px-4 py-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors",
        !notification.read && "bg-primary/5"
      )}
    >
      <div className="flex gap-3">
        <div className="w-10 flex justify-center flex-shrink-0">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage
                src={notification.user.avatar}
                alt={notification.user.name}
              />
              <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
            </Avatar>
            {notification.user.verified && (
              <BadgeCheck className="w-4 h-4 text-primary fill-primary flex-shrink-0 mt-0.5" />
            )}
          </div>

          <p className="text-foreground">
            <span className="font-semibold">{notification.user.name}</span>{' '}
            <span className="text-muted-foreground">{getMessage()}</span>
          </p>

          <p className="text-sm text-muted-foreground mt-1">
            {formatTimestamp(notification.timestamp)}
          </p>

          {notification.post && notification.type !== 'follow' && (
            <div className="mt-2 p-3 border border-border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {notification.post.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function Notifications() {
  const { notifications, markNotificationAsRead } = useApp();

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  return (
    <div>
      <div className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </div>

      <div>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div key={notification.id} onClick={() => handleNotificationClick(notification.id)}>
              <NotificationItem notification={notification} index={index} />
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
}
