const STORAGE_KEY_PREFIX = 'social-liked-posts';

const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}:${userId}`;

const readLikedPostIds = (userId?: string | null): Set<string> => {
	if (!userId || typeof window === 'undefined') {
		return new Set();
	}

	try {
		const rawValue = window.localStorage.getItem(getStorageKey(userId));
		if (!rawValue) {
			return new Set();
		}

		const parsedValue = JSON.parse(rawValue) as unknown;
		if (!Array.isArray(parsedValue)) {
			return new Set();
		}

		return new Set(parsedValue.filter((item): item is string => typeof item === 'string'));
	} catch {
		return new Set();
	}
};

const writeLikedPostIds = (userId: string | null | undefined, likedIds: Set<string>) => {
	if (!userId || typeof window === 'undefined') {
		return;
	}

	try {
		window.localStorage.setItem(getStorageKey(userId), JSON.stringify(Array.from(likedIds)));
	} catch {
	}
};

export const isPostLikedForUser = (userId: string | null | undefined, postId: string) => {
	return readLikedPostIds(userId).has(postId);
};

export const markPostLikedForUser = (userId: string | null | undefined, postId: string) => {
	const likedIds = readLikedPostIds(userId);
	likedIds.add(postId);
	writeLikedPostIds(userId, likedIds);
};

export const markPostUnlikedForUser = (userId: string | null | undefined, postId: string) => {
	const likedIds = readLikedPostIds(userId);
	likedIds.delete(postId);
	writeLikedPostIds(userId, likedIds);
};

export const mergeLikedStateForUser = <T extends { id?: string; Id?: string; isLiked?: boolean; originalPost?: any }>(
	posts: T[],
	userId: string | null | undefined,
): T[] => {
	if (!userId) {
		return posts;
	}

	return posts.map((post) => {
		const postId = post.id ?? post.Id;
		const originalPost = post.originalPost;

		let mergedPost = { ...post };

		if (postId) {
			const persistedLiked = isPostLikedForUser(userId, postId);
			mergedPost.isLiked = persistedLiked || Boolean(post.isLiked);
		}

		if (originalPost) {
			mergedPost.originalPost = mergeLikedStateForUser([originalPost], userId)[0];
		}

		return mergedPost;
	});
};
