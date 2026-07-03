export const colors = {
  primary: '#F97316',
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',
  gold: '#FBBF24',
  coral: '#FB7185',
  mint: '#34D399',
  mintLight: '#6EE7B7',
  background: '#FFF9F5',
  card: '#FFFFFF',
  textPrimary: '#292524',
  textSecondary: '#57534E',
  textLight: '#A8A29E',
  border: '#E7E5E4',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6'
}

export const gradients = {
  primary: 'linear-gradient(135deg, #F97316, #FB923C)',
  primaryVertical: 'linear-gradient(180deg, #F97316, #FB923C)',
  gold: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
  mint: 'linear-gradient(135deg, #34D399, #6EE7B7)',
  cardHeader: 'linear-gradient(135deg, #FFF9F5, #FFFFFF)'
}

export const shadows = {
  card: '0 4px 16px rgba(249, 115, 22, 0.08)',
  cardHover: '0 8px 24px rgba(249, 115, 22, 0.12)',
  button: '0 4px 12px rgba(251, 146, 60, 0.25)',
  buttonPress: '0 2px 6px rgba(251, 146, 60, 0.3)',
  avatar: '0 4px 12px rgba(249, 115, 22, 0.15)'
}

export const radii = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  full: '9999px'
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
}

export const fonts = {
  family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  size: {
    xs: '12px',
    sm: '14px',
    base: '15px',
    lg: '16px',
    xl: '18px',
    xxl: '24px',
    heading: '32px'
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    loose: 1.6
  }
}

export const transitions = {
  fast: '0.15s ease',
  normal: '0.25s ease',
  slow: '0.4s ease'
}

export const zIndex = {
  base: 1,
  dropdown: 100,
  modal: 200,
  toast: 300,
  loading: 400
}

export const tokens = {
  colors,
  gradients,
  shadows,
  radii,
  spacing,
  fonts,
  transitions,
  zIndex
}

export default tokens
