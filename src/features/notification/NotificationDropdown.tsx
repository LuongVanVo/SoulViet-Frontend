import { useNotifications } from '@/hooks';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useNavigate, Link } from 'react-router-dom';
import { NotificationTargetType, type Notification, NotificationType } from '@/types';
import { Bell, MoreHorizontal, Check, Heart, MessageCircle, UserPlus, Share2, ShieldCheck, Mail } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationDropdown = ({ isOpen, onClose }: NotificationDropdownProps) => {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language === 'vi' ? vi : enUS;

    const {
        notifications,
        isLoading,
        markAsRead,
        markAllAsRead
    } = useNotifications();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredNotifications = filter === 'all'
        ? notifications.slice(0, 10)
        : notifications.filter(n => !n.isRead).slice(0, 10);

    const getIconOverlay = (type: string | number) => {
        const iconClass = "w-3 h-3 text-white";
        const containerClass = "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm";

        const typeStr = String(type).toLowerCase();
        const typeNum = Number(type);

        if (typeStr === 'like' || typeNum === NotificationType.Liked) {
            return <div className={`${containerClass} bg-rose-500`}><Heart className={iconClass} fill="currentColor" /></div>;
        }
        if (typeStr === 'comment' || typeStr === 'commented' || typeNum === NotificationType.Commented) {
            return <div className={`${containerClass} bg-blue-500`}><MessageCircle className={iconClass} fill="currentColor" /></div>;
        }
        if (typeStr === 'follow' || typeStr === 'followed' || typeNum === NotificationType.Followed) {
            return <div className={`${containerClass} bg-brand`}><UserPlus className={iconClass} /></div>;
        }
        if (typeStr === 'share' || typeStr === 'shared' || typeNum === NotificationType.Shared) {
            return <div className={`${containerClass} bg-green-500`}><Share2 className={iconClass} /></div>;
        }
        if (typeStr === 'mentioned' || typeNum === NotificationType.Mentioned) {
            return <div className={`${containerClass} bg-orange-500`}><Mail className={iconClass} /></div>;
        }
        if (typeStr === 'partnerverified' || typeNum === NotificationType.PartnerVerified) {
            return <div className={`${containerClass} bg-blue-600`}><ShieldCheck className={iconClass} /></div>;
        }

        return <div className={`${containerClass} bg-gray-500`}><Bell className={iconClass} /></div>;
    };

    const handleNotificationClick = (notification: Notification) => {
        const targetId = notification.targetId || notification.postId || '';
        const typeStr = String(notification.type).toLowerCase();
        let targetType = String(notification.targetType || '').toLowerCase();

        if (!targetType || targetType === 'undefined') {
            if (['like', 'liked', 'comment', 'commented', 'share', 'shared'].includes(typeStr)) {
                targetType = 'post';
            } else if (['follow', 'followed'].includes(typeStr)) {
                targetType = 'user';
            }
        }

        let targetPath = '';
        const isShare = typeStr === 'share' || typeStr === 'shared' || notification.type === NotificationType.Shared;

        if (isShare) {
            const shareId = notification.postId || targetId;
            targetPath = `/posts/${shareId}`;
        } else if (targetType === '1' || targetType === 'post' || notification.targetType === NotificationTargetType.Post) {
            targetPath = `/posts/${targetId}`;
        } else if (targetType === '3' || targetType === 'user' || targetType === '4' || targetType === 'follow' || notification.targetType === NotificationTargetType.User || notification.targetType === NotificationTargetType.Follow) {
            targetPath = `/profile/${targetId}`;
        } else if (targetType === '2' || targetType === 'comment' || notification.targetType === NotificationTargetType.Comment) {
            targetPath = `/posts/${targetId}`;
        }

        console.log('--- Notification Click Debug ---');
        console.log('Full Notification Object:', notification);
        console.log('TargetId:', targetId);
        console.log('IsShare:', isShare);
        console.log('Navigating to:', targetPath);
        console.log('-------------------------------');

        if (targetPath) {
            navigate(targetPath);
        }

        onClose();

        if (!notification.isRead && notification.id) {
            setTimeout(() => {
                markAsRead(notification.id!);
            }, 100);
        }
    };

    return (
        <div
            ref={dropdownRef}
            className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-[56px] md:top-full mt-0 md:mt-2 w-auto md:w-[360px] max-w-[480px] md:max-w-[360px] max-h-[calc(100vh-100px)] md:max-h-[600px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-[100] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 mx-auto md:md:mx-0"
        >
            <div className="p-4 flex justify-between items-center bg-white/80 backdrop-blur-md">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">{t('notifications.title')}</h3>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="flex gap-2 px-4 py-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-[14px] font-semibold transition-all ${filter === 'all' ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    {t('notifications.filterAll')}
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-1.5 rounded-full text-[14px] font-semibold transition-all ${filter === 'unread' ? 'bg-brand/10 text-brand' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    {t('notifications.filterUnread')}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                <div className="px-4 flex justify-between items-center py-2">
                    <span className="text-[15px] font-bold text-gray-900">{t('notifications.previous')}</span>
                    <Link to="/notifications" onClick={onClose} className="text-sm text-brand hover:underline font-medium">
                        {t('notifications.viewAll')}
                    </Link>
                </div>

                {isLoading ? (
                    <div className="px-4 py-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-12 h-12 bg-gray-100 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                                    <div className="h-2 bg-gray-100 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="py-16 flex flex-col items-center text-gray-400">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                            <Bell className="w-10 h-10 text-gray-200" />
                        </div>
                        <p className="text-sm font-medium">{t('notifications.empty')}</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filteredNotifications.map((notification) => {
                            const actorName = notification.actorName && notification.actorName !== 'Anonymous' ? notification.actorName : '';
                            let displayContent = notification.message || notification.content || '';

                            const isShare = String(notification.type).toLowerCase().includes('share');
                            if (isShare && displayContent.includes(':')) {
                                displayContent = displayContent.split(':')[0].trim();
                            }

                            const isUnread = !notification.isRead;

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all relative ${isUnread ? 'bg-brand/5' : ''}`}
                                >
                                    <div className="relative shrink-0">
                                        {notification.actorAvatar ? (
                                            <img
                                                src={notification.actorAvatar}
                                                alt=""
                                                className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-100"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-brand/5 flex items-center justify-center text-brand shadow-inner">
                                                <Bell className="w-6 h-6" />
                                            </div>
                                        )}
                                        {getIconOverlay(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <p className={`text-[14px] leading-[1.3] mb-1 line-clamp-3 ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                            <span className="font-bold text-gray-900">{actorName}</span> {displayContent.replace(actorName, '').trim()}
                                        </p>
                                        <span className={`text-[13px] font-semibold ${isUnread ? 'text-brand' : 'text-gray-400'}`}>
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: currentLocale })}
                                        </span>
                                    </div>

                                    {isUnread && (
                                        <div className="shrink-0 pt-6">
                                            <div className="w-2.5 h-2.5 bg-brand rounded-full shadow-[0_0_8px_rgba(26,122,94,0.4)]" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-3 bg-gray-50/30 border-t border-gray-50">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                    }}
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                >
                    <Check className="w-4 h-4" />
                    {t('notifications.markAllAsRead')}
                </button>
            </div>
        </div>
    );
};
