let CameraRoll: any = null;
let PhotoIdentifier: any = null;

try {
  const cameraRollModule = require("@react-native-camera-roll/camera-roll");
  CameraRoll = cameraRollModule.CameraRoll;
  PhotoIdentifier = cameraRollModule.PhotoIdentifier;
} catch (error) {
  console.warn('CameraRoll not available, using fallback');
  CameraRoll = {
    getPhotos: () => Promise.resolve({ edges: [] }),
    save: () => Promise.resolve("fallback-uri"),
  };
  PhotoIdentifier = {};
}

export const useCameraRoll = () => {
  return {
    getPhotos: CameraRoll.getPhotos,
    save: CameraRoll.save,
  };
};

export { CameraRoll, PhotoIdentifier };