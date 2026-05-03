import React, { useState} from 'react';
import { X, Search, User as UserIcon, Lock } from 'lucide-react';
import { useFollowList } from '@/hooks/useFollowList';
import { useFollowUser } from '@/hooks/useFollowUser';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router-dom';

interface FollowListModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    type: 'followers' | 'following';
    title: string;
}

const FollowListItem = ({ user, type, isOwnProfile, onClose }: { user: any, type: 'followers' | 'following', isOwnProfile: boolean, onClose: () => void }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isFollowing, isLoading, followUser, unfollowUser, removeFollower } = useFollowUser(user.userId);

    const handleProfileClick = () => {
        navigate(`/profile/${user.userId}`);
        onClose();
    };

    const handleAction = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOwnProfile && type === 'followers') {
            await removeFollower();
            return;
        }

        if (isFollowing) {
            await unfollowUser();
        } else {
            await followUser();
        }
    };

    const getButtonContent = () => {
        const followingText = t('profile.public.following') === 'profile.public.following' ? 'Đang theo dõi' : t('profile.public.following');
        const followText = t('profile.public.follow') === 'profile.public.follow' ? 'Theo dõi' : t('profile.public.follow');
        const removeText = t('profile.user.followers.remove') === 'profile.user.followers.remove' ? 'Xóa' : t('profile.user.followers.remove');

        if (isOwnProfile && type === 'followers') {
            return {
                text: removeText,
                className: 'bg-[#3B6363] text-white hover:bg-[#2F4F4F]'
            };
        }

        if (isFollowing) {
            return {
                text: followingText,
                className: 'bg-[#F0F2F5] text-[#1C1E21] hover:bg-gray-200'
            };
        }

        return {
            text: followText,
            className: 'bg-[#3B6363] text-white hover:bg-[#2F4F4F]'
        };
    };

    const { text, className } = getButtonContent();
    const currentUserId = useAuthStore((state) => state.user?.id);
    const isMe = currentUserId === user.userId;

    return (
        <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors">
            <div
                className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                onClick={handleProfileClick}
            >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-50">
                    {user.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <UserIcon className="h-6 w-6" />
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <p className="truncate text-sm font-bold text-[#1C1E21] hover:underline">{user.fullName}</p>
                        {isOwnProfile && type === 'followers' && !isFollowing && (
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-gray-400 text-[10px]">·</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        followUser();
                                    }}
                                    disabled={isLoading}
                                    className="text-[13px] font-semibold text-[#0095F6] hover:text-[#00376B] disabled:opacity-50"
                                >
                                    {t('profile.public.follow') === 'profile.public.follow' ? 'Theo dõi' : t('profile.public.follow')}
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="truncate text-xs text-[#65676B]">@{user.userName || user.userId.split('-')[0]}</p>
                </div>
            </div>

            {!isMe && (
                <button
                    onClick={handleAction}
                    disabled={isLoading}
                    className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 ${className}`}
                >
                    {text}
                </button>
            )}
        </div>
    );
};

export const FollowListModal = ({ isOpen, onClose, userId, type, title }: FollowListModalProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentUserId = useAuthStore((state) => state.user?.id);
    const isOwnProfile = currentUserId === userId;
    const [search, setSearch] = useState('');
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useFollowList(userId, type, search, 20);

    React.useEffect(() => {
        if (isOpen) {
            setIsFirstLoad(true);
            refetch().finally(() => {
                setTimeout(() => setIsFirstLoad(false), 400);
            });
        }
    }, [isOpen, refetch]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const handleLoginRedirect = () => {
        const currentPath = window.location.pathname + window.location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <div className="w-8" />
                    <h2 className="text-base font-bold text-[#1C1E21]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="relative">
                    <div className={`px-4 py-3 transition-all ${!currentUserId ? 'blur-sm pointer-events-none select-none' : ''}`}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('common.search') === 'common.search' ? 'Tìm kiếm' : (t('common.search') || 'Tìm kiếm')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl bg-[#F0F2F5] py-2 pl-10 pr-4 text-sm outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div
                        className={`max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 transition-all ${!currentUserId ? 'blur-md pointer-events-none select-none' : ''}`}
                        onScroll={handleScroll}
                    >
                        {(isFirstLoad || isLoading) ? (
                            <div className="divide-y divide-gray-50 animate-pulse">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="flex items-center justify-between py-3 px-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-1/3" />
                                                <Skeleton className="h-3 w-1/4" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-8 w-20 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        ) : data && data.length > 0 ? (
                            <div className="divide-y divide-gray-50 animate-in fade-in duration-700 fill-mode-both">
                                {data.map((user: any) => (
                                    <FollowListItem key={user.userId} user={user} type={type} isOwnProfile={isOwnProfile} onClose={onClose} />
                                ))}
                                {isFetchingNextPage && (
                                    <div className="flex justify-center py-4">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <UserIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-500">
                                    {search
                                        ? (t('common.noResults') === 'common.noResults' ? 'Không tìm thấy kết quả' : t('common.noResults'))
                                        : (t('profile.user.noFollowers') === 'profile.user.noFollowers' ? 'Chưa có danh sách' : t('profile.user.noFollowers'))
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {!currentUserId && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 px-8 text-center backdrop-blur-[2px]">
                            <div className="mb-4 rounded-full bg-[#3B6363]/10 p-4">
                                <Lock className="h-8 w-8 text-[#3B6363]" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-[#1C1E21]">
                                {type === 'followers'
                                    ? t('profile.public.auth.titleFollowers')
                                    : t('profile.public.auth.titleFollowing')
                                }
                            </h3>
                            <p className="mb-6 text-sm text-gray-600">
                                {t('profile.public.auth.description')}
                            </p>
                            <button
                                onClick={handleLoginRedirect}
                                className="w-full rounded-full bg-[#3B6363] py-3 font-bold text-white shadow-lg shadow-[#3B6363]/20 transition-all hover:bg-[#2F4F4F] active:scale-95"
                            >
                                {t('profile.public.auth.loginButton')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
