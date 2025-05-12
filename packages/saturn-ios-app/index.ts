/**
 * Saturn iOS App - Simple Navigation Test
 */

import { AppRegistry } from 'react-native';
import SimpleNavigation from './SimpleNavigation';

// Log startup information
console.log('Initializing Saturn iOS app with basic NavigationContainer only');

// Register the app component with minimal Navigation wrapper
console.log('Registering simple navigation app');
AppRegistry.registerComponent('main', () => SimpleNavigation);
