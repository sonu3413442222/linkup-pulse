
import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthPage from '@/components/AuthPage';
import Header from '@/components/Header';
import Feed from '@/components/Feed';
import ProfilePage from '@/components/ProfilePage';
import ParticleBackground from '@/components/ParticleBackground';
import FloatingElements from '@/components/FloatingElements';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center relative overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10 text-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDelay: '0.5s' }}></div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-3xl shadow-2xl hover:scale-105 transition-transform duration-300">
            LinkUp Pulse
          </div>
          <p className="text-gray-600 text-lg font-medium animate-pulse">Connecting minds, sparking conversations...</p>
        </div>
        <FloatingElements />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <ParticleBackground />
        <FloatingElements />
        <div className="relative z-20">
          <AuthPage />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <ParticleBackground />
      <FloatingElements />
      
      <div className="relative z-20">
        <Header 
          user={user} 
          onLogout={handleLogout} 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
        
        <main className="container mx-auto px-4 py-8">
          <div className="animate-fade-in">
            {currentPage === 'home' && <Feed user={user} />}
            {currentPage === 'profile' && <ProfilePage user={user} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
