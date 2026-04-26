export interface FileUploadRequest {
  fileName: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  fileName: string;
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  mediaType: number;
}
