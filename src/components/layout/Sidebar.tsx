import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Map, Sparkles, Users, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { apiService } from '../../services/mockData';
import type { UserProfile } from '../../types';

export const Sidebar = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    apiService.getCurrentUser().then(setUser);
  }, []);

  const navItems = [
    { to: '/', icon: Home, label: t('sidebar.home') },
    { to: '/map', icon: Map, label: t('sidebar.map') },
    { to: '/ai-plan', icon: Sparkles, label: t('sidebar.aiPlan') },
    { to: '/social', icon: Users, label: t('sidebar.social') },
    { to: '/profile', icon: User, label: t(isLoggedIn ? 'sidebar.profile' : 'sidebar.login') },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0">
      <div className="pt-8 pb-6 px-6">
        <h1 className="text-2xl font-bold text-primary leading-tight">
          {t('sidebar.logo')}
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Soul Viet 2025</p>
        <p className="mt-1 text-xs text-gray-400">Explore authentic Vietnam</p>
      </div>
    </div>
  );
};
