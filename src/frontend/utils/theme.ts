// Theme colors and screens are duplicated in src/globals.css for Tailwind.
// Keep both files in sync when making changes.
export const themeColors = {
  current: 'currentColor',
  transparent: 'transparent',
  primary: {
    60: '#81FC05',
    80: '#70DF00',
    100: '#60BD02',
  },
  secondary: {
    20: '#8F8FFE',
    40: '#7272CB',
    60: '#565698',
    80: '#393966',
  },
  black: {
    80: '#282D30',
    100: '#1B1E25',
    120: '#060709',
    1000: '#000000',
  },
  grey: {
    20: '#DBE0E2',
    40: '#9EACB3',
    60: '#6B7980',
    80: '#505B60',
    100: '#363C40',
  },
  yellow: {
    80: '#BDC03D',
    100: '#DBDF00',
  },
  red: {
    80: '#D65961',
    100: '#BB434A',
  },
  white: {
    100: '#F9F9F9',
  },
  podium: {
    gold: '#F7D570',
    silver: '#DBDFE6',
    bronze: '#F49E71',
  },
} as const

export const themeScreens = {
  'xl-short': { raw: '(min-width: 1365px) and (max-height: 850px)' },
  lg: { max: '1365px' },
  md: { max: '1023px' },
  sm: { max: '767px' },
  touch: { raw: '(pointer:coarse)' },
} as const
