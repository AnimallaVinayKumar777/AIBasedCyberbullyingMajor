import { Home, Search, Bell, User, PenSquare, LogIn, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  icon: typeof Home;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Explore', icon: Search, path: '/explore' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Profile', icon: User, path: '/profile' },
];

interface SidebarNavProps {
  onComposeClick: () => void;
}

export const SidebarNav = ({ onComposeClick }: SidebarNavProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 h-screen flex flex-col p-4 border-r border-border w-64">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <PenSquare className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* User Profile Section */}
      {isAuthenticated && user ? (
        <div className="mb-6 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-muted-foreground text-xs truncate">{user.handle}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-3 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-2">Welcome to Chirp</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
            className="w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-4 px-4 py-3 rounded-full transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-muted text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-6 h-6', isActive && 'fill-current')} />
                <span className="text-lg">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="space-y-2">
        {isAuthenticated ? (
          <>
            <Button
              onClick={onComposeClick}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg font-semibold"
            >
              Post
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full rounded-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg font-semibold"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login to Post
          </Button>
        )}
      </div>
    </nav>
  );
};
