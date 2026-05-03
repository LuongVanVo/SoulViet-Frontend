import React, { useState } from 'react';
import { X, User as UserIcon, Lock } from 'lucide-react';
import { usePostLikers } from '@/hooks/usePostLikers';
import { useFollowUser } from '@/hooks/useFollowUser';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import type { PostLiker } from '@/types';

interface LikersModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
}

const LikerItem = ({ liker, onClose }: { liker: PostLiker, onClose: () => void }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.user);
    const currentUserId = currentUser?.id;

    const { isFollowing, isLoading, followUser, unfollowUser } = useFollowUser(liker.id, {
        isFollowing: liker.isFollowing,
        isFollower: liker.isFollower
    });

    const isMe = currentUserId === liker.id;

    const handleProfileClick = () => {
        navigate(`/profile/${liker.id}`);
        onClose();
    };

    const handleAction = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUserId) {
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            onClose();
            return;
        }

        if (isFollowing) {
            await unfollowUser();
        } else {
            await followUser();
        }
    };

    const getButtonContent = () => {
        if (isFollowing) {
            return {
                text: t('social.profile.following', { defaultValue: 'Đang theo dõi' }),
                className: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            };
        }

        if (liker.isFollower) {
            return {
                text: t('social.profile.followBack', { defaultValue: 'Theo dõi lại' }),
                className: 'bg-[#3B6363] text-white hover:bg-[#2F4F4F]'
            };
        }

        return {
            text: t('social.feed.post.actions.follow', { defaultValue: 'Theo dõi' }),
            className: 'bg-[#3B6363] text-white hover:bg-[#2F4F4F]'
        };
    };

    const { text, className } = getButtonContent();

    return (
        <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors group">
            <div
                className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                onClick={handleProfileClick}
            >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-50 ring-2 ring-transparent group-hover:ring-[#3B6363]/20 transition-all">
                    {liker.avatarUrl ? (
                        <img
                            src={liker.avatarUrl}
                            alt={liker.fullName}
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
                    <p className="truncate text-sm font-bold text-[#1C1E21] hover:underline">{liker.fullName}</p>
                    {liker.isLocalPartner && (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                            {t('common.localPartner', { defaultValue: 'Local Partner' })}
                        </span>
                    )}
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

export const LikersModal = ({ isOpen, onClose, postId }: LikersModalProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentUserId = useAuthStore((state) => state.user?.id);
    const { likers, totalCount, isLoading } = usePostLikers(postId, isOpen && !!currentUserId);
    const [search, setSearch] = useState('');

    const handleLoginRedirect = () => {
        const currentPath = window.location.pathname + window.location.search;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
        onClose();
    };

    if (!isOpen) return null;

    const filteredLikers = likers.filter(liker =>
        liker.fullName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        {t('social.feed.post.likers', { defaultValue: 'Lượt thích' })}
                        {currentUserId && <span className="ml-2 text-sm font-medium text-gray-500">({totalCount})</span>}
                    </h2>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="relative">
                    <div className={`${!currentUserId ? 'blur-sm pointer-events-none select-none' : ''}`}>
                        <div className="p-4 border-b border-gray-50">
                            <input
                                type="text"
                                placeholder={t('common.search', { defaultValue: 'Tìm kiếm' })}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl bg-gray-100 py-2.5 px-4 text-sm outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-[#3B6363]/20 transition-all"
                            />
                        </div>

                        <div className="max-h-[60vh] min-h-[300px] overflow-y-auto scrollbar-hide">
                            {isLoading ? (
                                <div className="divide-y divide-gray-50">
                                    {[1, 2, 3, 4, 5].map(i => (
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
                            ) : filteredLikers.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {filteredLikers.map((liker) => (
                                        <LikerItem key={liker.id} liker={liker} onClose={onClose} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <UserIcon className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">
                                        {search ? t('common.noResults', { defaultValue: 'Không tìm thấy kết quả' }) : t('social.feed.post.noLikers', { defaultValue: 'Chưa có lượt thích nào' })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {!currentUserId && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 px-8 text-center backdrop-blur-[2px]">
                            <div className="mb-4 rounded-full bg-[#3B6363]/10 p-4">
                                <Lock className="h-8 w-8 text-[#3B6363]" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-[#1C1E21]">
                                {t('social.feed.post.auth.titleLikers', { defaultValue: 'Xem người đã thích' })}
                            </h3>
                            <p className="mb-6 text-sm text-gray-600">
                                {t('profile.public.auth.description', { defaultValue: 'Đăng nhập để xem ai đã thích bài viết này và kết nối với họ.' })}
                            </p>
                            <button
                                onClick={handleLoginRedirect}
                                className="w-full rounded-full bg-[#3B6363] py-3 font-bold text-white shadow-lg shadow-[#3B6363]/20 transition-all hover:bg-[#2F4F4F] active:scale-95"
                            >
                                {t('profile.public.auth.loginButton', { defaultValue: 'Đăng nhập ngay' })}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
