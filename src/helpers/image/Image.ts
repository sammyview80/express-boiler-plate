import sharp, { ResizeOptions } from 'sharp';

export class Image {
  // Convert image to base64
  static toBase64 = (url: string): Promise<string> =>
    fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }),
      );

  //   Convert base64 to file
  static base64toFile(dataurl: string, filename: string): File | null {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/);

    if (!mime) {
      console.error('Invalid data URL format');
      return null;
    }

    const mimeType = mime[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mimeType });
  }

  // Convert url to file
  static urltoFile = async (url: string, fileName: string = 'image.jpg') => {
    const base64 = await Image.toBase64(url);
    const file = Image.base64toFile(base64, fileName);
    return file;
  };

  // Remove background from image using third party api
  static removeBg = (image: Express.Multer.File | string) => {
    if (typeof image === 'string') {
      // Convert the image_url to file
      // and remove the background
      // Call third party api to remove background.
    }
  };

  // Optimize image
  static optimizeImage = async (
    file: Express.Multer.File,
    {
      height = 500,
      width = 500,
      quality,
      resizeOptions,
    }: {
      width?: number;
      height?: number;
      quality?: number;
      resizeOptions?: ResizeOptions;
    },
  ) => {
    return await sharp(file?.buffer)
      .resize(height, width, resizeOptions)
      .withMetadata()
      .jpeg({ quality })
      .toBuffer();
  };
}
