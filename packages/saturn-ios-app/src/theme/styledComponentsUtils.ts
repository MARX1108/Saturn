import { DefaultTheme } from 'styled-components/native';
import styled from 'styled-components/native';

// Define the styled components helper with proper TypeScript support
// This creates a version of styled components that automatically includes the theme type
const createStyledComponent = styled;

export { createStyledComponent as styled }; 