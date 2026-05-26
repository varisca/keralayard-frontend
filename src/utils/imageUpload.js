import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const DATA_URL_MAX_WIDTH = 900;
const DATA_URL_QUALITY = 0.75;

const fileToImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file"));
    };
    img.src = url;
  });

export const imageFileToDataUrl = async (file) => {
  const img = await fileToImage(file);
  const scale = Math.min(1, DATA_URL_MAX_WIDTH / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", DATA_URL_QUALITY);
};

export const uploadImageWithFallback = async ({ storage, file, path, skipStorage = false }) => {
  if (skipStorage) {
    return {
      url: await imageFileToDataUrl(file),
      storageBacked: false,
    };
  }

  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return {
      url: await getDownloadURL(snapshot.ref),
      storageBacked: true,
    };
  } catch (error) {
    console.warn("Firebase Storage upload failed, using compressed data URL fallback:", error);
    return {
      url: await imageFileToDataUrl(file),
      storageBacked: false,
    };
  }
};
