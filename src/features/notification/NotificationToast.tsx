import { Bell } from 'lucide-react';
import { NotificationTargetType, type Notification } from '@/types';
import { toast } from 'react-hot-toast';

interface NotificationToastProps {
    notification: Notification;
    displayTitle: string;
    displayContent: string;
    targetId: string;
    navigate: (path: string) => void;
    onMarkAsRead: (id: string) => void;
    toastId: string;
}

export const NotificationToast = ({
    notification,
    displayTitle,
    displayContent,
    targetId,
    navigate,
    onMarkAsRead,
    toastId
}: NotificationToastProps) => {
    return (
        <div
            onClick={() => {
                toast.dismiss(toastId);

                if (!notification.isRead && notification.id) {
                    onMarkAsRead(notification.id);
                }

                const targetType = String(notification.targetType).toLowerCase();

                if (targetType === '1' || targetType === 'post' || notification.targetType === NotificationTargetType.Post) {
                    navigate(`/posts/${targetId}`);
                } else if (targetType === '3' || targetType === 'user' || targetType === '4' || targetType === 'follow' || notification.targetType === NotificationTargetType.User || notification.targetType === NotificationTargetType.Follow) {
                    navigate(`/profile/${targetId}`);
                } else if (targetType === '2' || targetType === 'comment' || notification.targetType === NotificationTargetType.Comment) {
                    navigate(`/posts/${targetId}`);
                }
            }}
            className="flex items-center gap-3 p-1 cursor-pointer"
        >
            {notification.actorAvatar ? (
                <img
                    src={notification.actorAvatar}
                    alt={notification.actorName}
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                />
            ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Bell className="w-5 h-5" />
                </div>
            )}
            <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-sm truncate">{displayTitle}</span>
                <span className="text-xs text-gray-600 line-clamp-2">{displayContent}</span>
            </div>
        </div>
    );
};
