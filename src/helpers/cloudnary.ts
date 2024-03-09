/* eslint-disable no-async-promise-executor */
import { UploadApiResponse, v2 } from 'cloudinary';
import { Image } from './image/Image';

interface FileUploadResponse<T> {
  res: T;
  isSuccess: boolean;
}

const BASE_FOLDER = 'test';

v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class Cloudnary {
  static async handleUpload(file: Express.Multer.File | Buffer) {
    let base64String = '';

    const b64 = Buffer.from(
      file instanceof Buffer ? file : file.buffer,
    ).toString('base64');
    base64String = 'data:' + ';base64,' + b64;
    const res = await v2.uploader.upload(base64String, {
      resource_type: 'auto',
      folder: BASE_FOLDER,
    });
    return res;
  }

  static extractPublicIdFromCloudinaryURL(url: string, folderName: string) {
    try {
      const array = url.split(folderName);
      const pid = array.splice(-1);
      const path = pid[0].split('.')[0];

      return folderName + path;
    } catch (error) {
      console.error('Error extracting path:', error);
      return null;
    }
  }

  static async handleUpdateFile(prevUrl: string, newFile: Express.Multer.File) {
    return new Promise<FileUploadResponse<UploadApiResponse>>(
      async (resolve, reject) => {
        const { isSuccess } = await handleDeleteFile(prevUrl);
        if (!isSuccess)
          return reject({
            res: { message: 'Error deleting file' },
            isSuccess: false,
          });
        const resizeImage = await Image.optimizeImage(newFile, {
          quality: 80,
          resizeOptions: {
            withoutEnlargement: true,
            fit: 'inside',
          },
        });
        const imageResponse = await handleUpload(resizeImage);

        return resolve({ res: imageResponse, isSuccess: true });
      },
    );
  }

  static async handleDeleteFile(filename: string) {
    return new Promise<FileUploadResponse<Error | { info: string }>>(
      async (resolve, reject) => {
        try {
          const publicId = extractPublicIdFromCloudinaryURL(
            filename,
            BASE_FOLDER,
          );
          if (publicId) {
            const res = await v2.uploader.destroy(publicId);
            return resolve({ res, isSuccess: true });
          }
          return resolve({
            res: { info: 'No public id found' },
            isSuccess: false,
          });
        } catch (err) {
          console.error(err);
          return reject({ res: err, isSuccess: false });
        }
      },
    );
  }
}

async function handleUpload(file: Express.Multer.File | Buffer) {
  let base64String = '';

  const b64 = Buffer.from(file instanceof Buffer ? file : file.buffer).toString(
    'base64',
  );
  base64String = 'data:' + ';base64,' + b64;
  const res = await v2.uploader.upload(base64String, {
    resource_type: 'auto',
    folder: BASE_FOLDER,
  });
  return res;
}
function extractPublicIdFromCloudinaryURL(
  url: string,
  folderName: string = BASE_FOLDER,
) {
  try {
    const array = url.split(folderName);
    const pid = array.splice(-1);
    const path = pid[0].split('.')[0];

    return folderName + path;
  } catch (error) {
    console.error('Error extracting path:', error);
    return null;
  }
}

async function handleUpdateFile(prevUrl: string, newFile: Express.Multer.File) {
  return new Promise<FileUploadResponse<UploadApiResponse>>(
    async (resolve, reject) => {
      const { isSuccess } = await handleDeleteFile(prevUrl);
      if (!isSuccess)
        return reject({
          res: { message: 'Error deleting file' },
          isSuccess: false,
        });
      const resizeImage = await Image.optimizeImage(newFile, {
        quality: 80,
        resizeOptions: {
          withoutEnlargement: true,
          fit: 'inside',
        },
      });
      const imageResponse = await handleUpload(resizeImage);

      return resolve({ res: imageResponse, isSuccess: true });
    },
  );
}

async function handleDeleteFile(filename: string) {
  return new Promise<FileUploadResponse<Error | { info: string }>>(
    async (resolve, reject) => {
      try {
        const publicId = extractPublicIdFromCloudinaryURL(
          filename,
          BASE_FOLDER,
        );
        if (publicId) {
          const res = await v2.uploader.destroy(publicId);
          return resolve({ res, isSuccess: true });
        }
        return resolve({
          res: { info: 'No public id found' },
          isSuccess: false,
        });
      } catch (err) {
        console.error(err);
        return reject({ res: err, isSuccess: false });
      }
    },
  );
}

export { v2, handleUpdateFile };
