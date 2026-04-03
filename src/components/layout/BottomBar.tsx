import { useTranslation } from 'react-i18next';
import { Home, Map, Sparkles, Users, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiService } from '../../services/mockData';
import type { UserProfile } from '../../types';

export const BottomBar = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    apiService.getCurrentUser().then(setUser);
  }, []);

  const navItems = [
    { to: '/', icon: Home, label: t('sidebar.home') },
    { to: '/map', icon: Map, label: t('sidebar.map') },
    { to: '/ai-plan', icon: Sparkles, label: t('sidebar.aiPlan'), floating: true },
    { to: '/community', icon: Users, label: t('sidebar.community') },
    { to: '/profile', icon: User, label: t(isLoggedIn ? 'sidebar.profile' : 'sidebar.login') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex flex-row justify-between items-center py-2 z-50 xl:hidden rounded-t-3xl shadow-[0_-2px_16px_0_rgba(0,0,0,0.06)]">
      {navItems.map((item, idx) => {
        if (item.floating) {
          return (
            <div key={item.to} className="flex-1 flex flex-col items-center justify-end relative z-10 -mt-10">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-center w-20 h-20 rounded-full bg-secondary shadow-lg border-4 border-white ${
                    isActive ? 'text-white font-bold' : 'text-white/90'
                  } transition-all duration-200`
                }
                style={{ boxShadow: '0 4px 24px 0 rgba(255,193,7,0.25)' }}
              >
                <item.icon className="w-9 h-9" />
              </NavLink>
              <span className="mt-2 text-xs text-text-dark text-center select-none" style={{lineHeight:1}}>{item.label}</span>
            </div>
          );
        }
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 px-1 py-1 responsive-text font-medium transition-all ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
              }`
            }
          >
            <item.icon className="w-6 h-6 mb-0.5" />
            <span className="text-xs mt-0.5">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
