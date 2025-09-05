// CampusKinect Color Scheme - Olive Green Theme
export const colors = {
  // Primary Colors
  primary: {
    50: '#f2f5f4',   // Very light olive
    100: '#e6ebea',  // Light olive
    200: '#bfcdc8',  // Lighter olive
    300: '#99afa7',  // Light olive
    400: '#708d81',  // Main olive green
    500: '#5a7268',  // Medium olive
    600: '#445750',  // Darker olive
    700: '#2e3c38',  // Dark olive
    800: '#172120',  // Very dark olive
    900: '#0b1110',  // Almost black olive
  },

  // Accent Colors
  accent: {
    50: '#f0f9ff',   // Light blue
    100: '#e0f2fe',  // Light blue
    200: '#bae6fd',  // Blue
    300: '#7dd3fc',  // Medium blue
    400: '#38bdf8',  // Blue
    500: '#0ea5e9',  // Primary blue
    600: '#0284c7',  // Dark blue
    700: '#0369a1',  // Darker blue
    800: '#075985',  // Very dark blue
    900: '#0c4a6e',  // Almost black blue
  },

  // Neutral Colors
  neutral: {
    50: '#fafafa',   // Very light gray
    100: '#f5f5f5',  // Light gray
    200: '#e5e5e5',  // Gray
    300: '#d4d4d4',  // Medium gray
    400: '#a3a3a3',  // Gray
    500: '#737373',  // Medium gray
    600: '#525252',  // Dark gray
    700: '#404040',  // Darker gray
    800: '#262626',  // Very dark gray
    900: '#171717',  // Almost black
  },

  // Success Colors (Green tones that complement olive)
  success: {
    50: '#f0fdf4',   // Very light green
    100: '#dcfce7',  // Light green
    200: '#bbf7d0',  // Green
    300: '#86efac',  // Medium green
    400: '#4ade80',  // Green
    500: '#22c55e',  // Primary green
    600: '#16a34a',  // Dark green
    700: '#15803d',  // Darker green
    800: '#166534',  // Very dark green
    900: '#14532d',  // Almost black green
  },

  // Warning Colors (Warm tones that complement olive)
  warning: {
    50: '#fffbeb',   // Very light amber
    100: '#fef3c7',  // Light amber
    200: '#fde68a',  // Amber
    300: '#fcd34d',  // Medium amber
    400: '#fbbf24',  // Amber
    500: '#f59e0b',  // Primary amber
    600: '#d97706',  // Dark amber
    700: '#b45309',  // Darker amber
    800: '#92400e',  // Very dark amber
    900: '#78350f',  // Almost black amber
  },

  // Error Colors (Red tones that complement olive)
  error: {
    50: '#fef2f2',   // Very light red
    100: '#fee2e2',  // Light red
    200: '#fecaca',  // Red
    300: '#fca5a5',  // Medium red
    400: '#f87171',  // Red
    500: '#ef4444',  // Primary red
    600: '#dc2626',  // Dark red
    700: '#b91c1c',  // Darker red
    800: '#991b1b',  // Very dark red
    900: '#7f1d1d',  // Almost black red
  },

  // Semantic Colors
  semantic: {
    primary: '#708d81',      // Main olive green
    secondary: '#5a7268',    // Darker olive
    accent: '#0ea5e9',       // Blue accent
    success: '#22c55e',      // Green success
    warning: '#f59e0b',      // Amber warning
    error: '#ef4444',        // Red error
    info: '#3b82f6',         // Blue info
    light: '#f2f5f4',        // Light olive
    dark: '#2e3c38',         // Dark olive
  }
};

// CSS Custom Properties for easy use in CSS
export const cssVariables = `
  :root {
    /* Primary Colors */
    --color-primary-50: ${colors.primary[50]};
    --color-primary-100: ${colors.primary[100]};
    --color-primary-200: ${colors.primary[200]};
    --color-primary-300: ${colors.primary[300]};
    --color-primary-400: ${colors.primary[400]};
    --color-primary-500: ${colors.primary[500]};
    --color-primary-600: ${colors.primary[600]};
    --color-primary-700: ${colors.primary[700]};
    --color-primary-800: ${colors.primary[800]};
    --color-primary-900: ${colors.primary[900]};

    /* Accent Colors */
    --color-accent-50: ${colors.accent[50]};
    --color-accent-100: ${colors.accent[100]};
    --color-accent-200: ${colors.accent[200]};
    --color-accent-300: ${colors.accent[300]};
    --color-accent-400: ${colors.accent[400]};
    --color-accent-500: ${colors.accent[500]};
    --color-accent-600: ${colors.accent[600]};
    --color-accent-700: ${colors.accent[700]};
    --color-accent-800: ${colors.accent[800]};
    --color-accent-900: ${colors.accent[900]};

    /* Neutral Colors */
    --color-neutral-50: ${colors.neutral[50]};
    --color-neutral-100: ${colors.neutral[100]};
    --color-neutral-200: ${colors.neutral[200]};
    --color-neutral-300: ${colors.neutral[300]};
    --color-neutral-400: ${colors.neutral[400]};
    --color-neutral-500: ${colors.neutral[500]};
    --color-neutral-600: ${colors.neutral[600]};
    --color-neutral-700: ${colors.neutral[700]};
    --color-neutral-800: ${colors.neutral[800]};
    --color-neutral-900: ${colors.neutral[900]};

    /* Semantic Colors */
    --color-primary: ${colors.semantic.primary};
    --color-secondary: ${colors.semantic.secondary};
    --color-accent: ${colors.semantic.accent};
    --color-success: ${colors.semantic.success};
    --color-warning: ${colors.semantic.warning};
    --color-error: ${colors.semantic.error};
    --color-info: ${colors.semantic.info};
    --color-light: ${colors.semantic.light};
    --color-dark: ${colors.semantic.dark};
  }
`;

export default colors; 