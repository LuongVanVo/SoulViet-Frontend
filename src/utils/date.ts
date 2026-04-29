import i18n from '@/config/i18n';

export const formatSocialTime = (createdAt: string): string => {
	const createdTime = new Date(createdAt).getTime();
	if (Number.isNaN(createdTime)) {
		return createdAt;
	}

	const diffInSeconds = Math.max(0, Math.floor((Date.now() - createdTime) / 1000));

	if (diffInSeconds < 60) {
		return i18n.t('profile.user.posts.timeAgo.justNow', { defaultValue: 'Vừa xong' });
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return i18n.t('profile.user.posts.timeAgo.minutesAgo', { count: diffInMinutes, defaultValue: `${diffInMinutes} phút trước` });
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return i18n.t('profile.user.posts.timeAgo.hoursAgo', { count: diffInHours, defaultValue: `${diffInHours} giờ trước` });
	}

	const date = new Date(createdAt);
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();

	return `${day}/${month}/${year}`;
};
