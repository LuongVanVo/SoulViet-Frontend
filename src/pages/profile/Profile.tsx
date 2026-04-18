import { useEffect, useState } from 'react';
import { apiService } from '@/services';
import type { UserProfile } from '@/types';
import { useAuthStore } from '@/store';
import { AuthPage } from './AuthPage';
import { UserProfilePage } from './UserProfilePage';

export const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const setStoreUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    apiService.getCurrentUser().then((userData) => {
      setUser(userData);
      setStoreUser(userData);
    });
  }, [setStoreUser]);

  const handleAuthSuccess = (userData: UserProfile) => {
    setUser(userData);
    setStoreUser(userData);
  };

  const handleLoggedOut = () => {
    setUser(null);
    setStoreUser(null);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {user ? (
        <UserProfilePage user={user} onLoggedOut={handleLoggedOut} />
      ) : (
        <AuthPage authMode={authMode} onChangeMode={setAuthMode} onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
};