import axios from 'axios';
import { apiClient } from './axios';
import type { FileUploadRequest, PresignedUrlResponse } from '@/types';

const r2UploadClient = axios.create();

export const mediaApi = {
  getSocialPostPresignedUrls: (requests: FileUploadRequest[]): Promise<PresignedUrlResponse[]> => {
    return apiClient.post('/Media/presigned-urls/social-post', requests).then((res) => res.data.data);
  },
  uploadFileToR2: async (uploadUrl: string, file: File, fileName: string) => {
    return r2UploadClient.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
        'x-amz-meta-original-name': fileName,
      },
    });
  },
};
