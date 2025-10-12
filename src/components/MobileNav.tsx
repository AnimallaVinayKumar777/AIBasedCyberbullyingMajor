import { Home, Search, Bell, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: typeof Home;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, path: '/' },
  { icon: Search, path: '/explore' },
  { icon: Bell, path: '/notifications' },
  { icon: User, path: '/profile' },
];

export const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-center w-full h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <item.icon className={cn('w-6 h-6', isActive && 'fill-current')} />
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
