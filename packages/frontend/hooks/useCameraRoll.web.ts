export const useCameraRoll = () => {
  return {
    getPhotos: () => Promise.resolve({ edges: [] }),
    save: () => Promise.resolve(""),
  };
};

export const CameraRoll = {
  getPhotos: () => Promise.resolve({ edges: [] }),
  save: () => Promise.resolve(""),
};

export const PhotoIdentifier = {};