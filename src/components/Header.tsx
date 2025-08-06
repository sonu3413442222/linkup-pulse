
import React from 'react';
import { User, LogOut, Home, User as UserIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HeaderProps {
  user: any;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header = ({ user, onLogout, currentPage, onNavigate }: HeaderProps) => {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error logging out');
        return;
      }
      toast.success('Logged out successfully!');
      onLogout();
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xl animate-fade-in">
              LinkUp Pulse
            </div>
          </div>

          {user && (
            <nav className="hidden md:flex items-center space-x-2">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
              >
                <Home size={20} />
                <span>Feed</span>
              </Button>
              <Button
                variant={currentPage === 'profile' ? 'default' : 'ghost'}
                onClick={() => onNavigate('profile')}
                className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
              >
                <UserIcon size={20} />
                <span>Profile</span>
              </Button>
            </nav>
          )}

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors duration-200"
              >
                <LogOut size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
