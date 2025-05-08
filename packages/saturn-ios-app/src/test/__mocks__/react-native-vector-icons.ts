// Mock for react-native-vector-icons
const Icon = () => 'Icon';

// Add static methods and properties that might be used
Icon.Button = ({ children }: { children: React.ReactNode }) => children;
Icon.getImageSource = jest.fn().mockResolvedValue('');

// Export as default with name for all Icon types (Ionicons, MaterialIcons, etc.)
export default Icon;
