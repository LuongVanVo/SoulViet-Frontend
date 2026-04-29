const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const readFirstText = (...values: unknown[]) => values.find(hasText)?.trim();

export const SOCIAL_LOCATION_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getPostLocationName = (post: any): string | undefined => {
	return readFirstText(
		post?.checkinLocationName,
		post?.CheckinLocationName,
		post?.checkinLocation?.name,
		post?.checkinLocation?.Name,
		post?.checkinLocation?.displayName,
		post?.checkinLocation?.DisplayName,
		post?.location,
		post?.Location,
	);
};

export const getPostCheckinLocationId = (post: any): string | undefined => {
	return readFirstText(
		post?.checkinLocationId,
		post?.CheckinLocationId,
		post?.checkinLocation?.id,
		post?.checkinLocation?.Id,
		post?.locationId,
		post?.LocationId,
	);
};