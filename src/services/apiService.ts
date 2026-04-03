import { vibeApi } from './vibe.api';
import { touristApi } from './tourist.api';
import { userApi } from './user.api';

export const apiService = {
  getVibeTags: vibeApi.getVibeTags,
  getTouristAttractionsCards: touristApi.getTouristAttractions,
  getCurrentUser: userApi.getCurrentUser,
};