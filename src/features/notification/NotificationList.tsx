import { useNotifications } from '@/hooks';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { NotificationTargetType, type Notification } from '@/types';
import { Bell, Check, Ghost, Heart, MessageCircle, UserPlus, Share2, ShieldCheck, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NotificationType } from '@/types';

export const NotificationList = () => {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language === 'vi' ? vi : enUS;

    const {
        notifications,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        markAsRead,
        markAllAsRead
    } = useNotifications();
    const navigate = useNavigate();

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
        if (!notification.isRead && notification.id) {
            markAsRead(notification.id);
        }

        const targetId = notification.targetId || notification.postId || '';
        const typeStr = String(notification.type).toLowerCase();
        const isShare = typeStr === 'share' || typeStr === 'shared' || notification.type === NotificationType.Shared;

        let targetPath = '';
        if (isShare) {
            const shareId = notification.postId || targetId;
            targetPath = `/posts/${shareId}`;
        } else if (String(notification.targetType) === '1' || String(notification.targetType).toLowerCase() === 'post' || notification.targetType === NotificationTargetType.Post) {
            targetPath = `/posts/${targetId}`;
        } else if (String(notification.targetType) === '3' || String(notification.targetType).toLowerCase() === 'user' || String(notification.targetType) === '4' || String(notification.targetType).toLowerCase() === 'follow' || notification.targetType === NotificationTargetType.User || notification.targetType === NotificationTargetType.Follow) {
            targetPath = `/profile/${targetId}`;
        } else if (String(notification.targetType) === '2' || String(notification.targetType).toLowerCase() === 'comment' || notification.targetType === NotificationTargetType.Comment) {
            targetPath = `/posts/${targetId}`;
        }

        if (targetPath) {
            console.log('--- Notification List Click Debug ---');
            console.log('Full Notification Object:', notification);
            console.log('TargetId:', targetId);
            console.log('Navigating to:', targetPath);
            console.log('------------------------------------');
            navigate(targetPath);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Ghost className="w-12 h-12 text-gray-300" />
                </div>
                <p className="text-sm font-medium">{t('notifications.empty')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-xl font-bold text-gray-900">{t('notifications.title')}</h2>
                <button
                    onClick={() => markAllAsRead()}
                    className="text-sm text-brand font-medium hover:underline flex items-center gap-1"
                >
                    <Check className="w-4 h-4" />
                    {t('notifications.markAllAsRead')}
                </button>
            </div>

            <div className="flex flex-col gap-1">
                {notifications.map((notification) => {
                    const displayTitle = notification.title || (notification.actorName && notification.actorName !== 'Anonymous' ? notification.actorName : t('notifications.newNotification'));
                    let displayContent = notification.message || notification.content || '';

                    // Clean up share notification: remove everything after ":"
                    const isShare = String(notification.type).toLowerCase().includes('share');
                    if (isShare && displayContent.includes(':')) {
                        displayContent = displayContent.split(':')[0].trim();
                    }

                    return (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 ${notification.isRead ? 'bg-white' : 'bg-brand/5'
                                }`}
                        >
                            <div className="relative shrink-0">
                                {notification.actorAvatar ? (
                                    <img
                                        src={notification.actorAvatar}
                                        alt={notification.actorName}
                                        className="w-12 h-12 rounded-full object-cover shadow-sm border border-white"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand shadow-sm">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                )}
                                {getIconOverlay(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm ${notification.isRead ? 'text-gray-900' : 'text-black font-semibold'} truncate`}>
                                        {displayTitle}
                                    </span>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: currentLocale })}
                                    </span>
                                </div>
                                <p className={`text-xs ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'} line-clamp-2`}>
                                    {displayContent}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasNextPage && (
                <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="mt-4 py-2 text-sm text-gray-500 hover:text-brand transition-colors disabled:opacity-50"
                >
                    {isFetchingNextPage ? t('notifications.loadingMore') : t('notifications.loadMore')}
                </button>
            )}
        </div>
    );
};
