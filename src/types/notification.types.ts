export const NotificationTargetType = {
    None: 0,
    Post: 1,
    Comment: 2,
    User: 3,
    Follow: 4
} as const;

export type NotificationTargetType = (typeof NotificationTargetType)[keyof typeof NotificationTargetType];

export const NotificationType = {
    Liked: 1,
    Commented: 2,
    Followed: 3,
    Mentioned: 4,
    Shared: 5,
    PartnerVerified: 6
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
    id: string;
    userId: string;
    title?: string;
    content?: string;
    message?: string;
    targetType: NotificationTargetType;
    type: NotificationType | string;
    targetId?: string;
    postId?: string;
    isRead: boolean;
    createdAt: string;
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
}

export interface GetNotificationsParams {
    after?: string;
    first?: number;
}
