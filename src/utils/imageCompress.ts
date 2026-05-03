import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';

export const compressImageToWebP = async (file: File): Promise<File> => {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
    };

    try {
        const compressedBlob = await imageCompression(file, options);
        return new File([compressedBlob], `${uuidv4()}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
        });
    } catch (error) {
        throw error;
    }
};
