let DocumentPicker: any = null;

try {
  DocumentPicker = require('react-native-document-picker').default;
} catch (error) {
  console.warn('DocumentPicker not available, using fallback');
  DocumentPicker = {
    pick: () => Promise.reject(new Error('DocumentPicker not available in Expo Go')),
    pickSingle: () => Promise.reject(new Error('DocumentPicker not available in Expo Go')),
    isCancel: () => false,
    types: {
      allFiles: '*/*',
      images: 'image/*',
      plainText: 'text/plain',
      audio: 'audio/*',
      pdf: 'application/pdf',
    }
  };
}

export default DocumentPicker;