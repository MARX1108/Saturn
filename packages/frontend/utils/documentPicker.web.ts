export default {
  pick: () => Promise.reject(new Error("Not available on web")),
  pickSingle: () => Promise.reject(new Error("Not available on web")),
  types: {
    audio: "audio/*",
    images: "image/*",
    video: "video/*",
    allFiles: "*/*"
  }
};