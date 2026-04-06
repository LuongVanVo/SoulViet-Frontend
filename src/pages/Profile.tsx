import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeroSection } from '../components/layout/PageHeroSection';
import { apiService } from '../services/mockData';
import type { UserProfile } from '../types';
import { AuthPage } from './profile/AuthPage';
import { UserProfilePage } from './profile/UserProfilePage';

export const Profile = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    apiService.getCurrentUser().then(setUser);
  }, []);

  const heroTitle = user
    ? t('profile.title')
    : authMode === 'login'
      ? t('profile.auth.loginTitle')
      : t('profile.auth.registerTitle');

  const heroSubtitle = user
    ? t('profile.subtitle')
    : authMode === 'login'
      ? t('profile.auth.loginSubtitle')
      : t('profile.auth.registerSubtitle');

  const handleAuthSuccess = (userData: UserProfile) => {
    setUser(userData);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-5">
      <PageHeroSection
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      {user ? (
        <UserProfilePage user={user} />
      ) : (
        <AuthPage authMode={authMode} onChangeMode={setAuthMode} onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
};