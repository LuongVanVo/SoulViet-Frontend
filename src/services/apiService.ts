import { vibeApi } from './vibe';
import { touristApi } from './tourist';
import { userApi } from './user';

export const apiService = {
  getVibeTags: vibeApi.getVibeTags,
  getTouristAttractionsCards: touristApi.getTouristAttractions,
  getCurrentUser: userApi.getCurrentUser,
};