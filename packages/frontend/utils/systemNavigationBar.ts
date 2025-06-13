let SystemNavigationBar: any = null;

try {
  SystemNavigationBar = require('react-native-system-navigation-bar').default;
} catch (error) {
  console.warn('SystemNavigationBar not available, using fallback');
  SystemNavigationBar = {
    setNavigationColor: () => Promise.resolve(),
    setNavigationBarContrastEnforced: () => Promise.resolve(),
    setNavigationBarStyle: () => Promise.resolve(),
    setNavigationBarColor: () => Promise.resolve(),
    NO_MODE: 0,
    LIGHT_MODE: 1,
    DARK_MODE: 2,
  };
}

export default SystemNavigationBar;