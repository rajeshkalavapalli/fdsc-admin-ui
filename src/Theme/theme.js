import { createTheme, alpha } from '@mui/material/styles'

/* FDSC — Royal Navy & Gold, as a Material UI theme. All colours, type and component
   styling come from here; components use theme values through `sx`. */

const navy = '#0b1a33'
const navy2 = '#112447'
const navyDeep = '#07111f'
const gold = '#c9a04e'
const goldDeep = '#7d6220' // darker gold for text on light backgrounds (WCAG AA contrast)
const goldLight = '#e8cd8a'
const paper = '#f8f6f1'
const paper2 = '#efebe2'

const display = "'Gambetta', Georgia, serif"
const body = "'Switzer', system-ui, sans-serif"

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: navy, light: '#1a3360', dark: navyDeep, contrastText: '#ffffff' },
    secondary: { main: gold, light: goldLight, dark: goldDeep, contrastText: navy },
    background: { default: paper, paper: '#ffffff' },
    text: { primary: navy, secondary: '#4b5567', disabled: '#8790a0' },
    divider: alpha(navy, 0.12),
    success: { main: '#2e7d5b' },
    error: { main: '#b3412b' },
    brand: { navy, navy2, navyDeep, gold, goldDeep, goldLight, paper, paper2, onNavy: '#f8f6f1', onNavy2: '#a9b4c8' },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: body,
    fontSize: 15,
    h1: { fontFamily: display, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.04 },
    h2: { fontFamily: display, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.06 },
    h3: { fontFamily: display, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.12 },
    h4: { fontFamily: display, fontWeight: 600, lineHeight: 1.15 },
    h5: { fontFamily: display, fontWeight: 600, lineHeight: 1.2 },
    h6: { fontFamily: display, fontWeight: 600, lineHeight: 1.25 },
    subtitle1: { fontWeight: 600, lineHeight: 1.45 },
    body1: { fontSize: '1.0625rem', lineHeight: 1.65 },
    body2: { fontSize: '0.95rem', lineHeight: 1.6 },
    overline: { fontWeight: 600, letterSpacing: '0.14em', lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  breakpoints: { values: { xs: 0, sm: 640, md: 900, lg: 1200, xl: 1536 } },
})

theme = createTheme(theme, {
  typography: {
    h1: { fontSize: 'clamp(2.9rem, 6vw, 6rem)' },
    h2: { fontSize: 'clamp(2.1rem, 4.2vw, 3.5rem)' },
    h3: { fontSize: 'clamp(1.7rem, 3vw, 2.6rem)' },
    h4: { fontSize: 'clamp(1.35rem, 2vw, 1.65rem)' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { overflowX: 'hidden', WebkitFontSmoothing: 'antialiased' },
        '::selection': { background: navy, color: goldLight },
        a: { color: 'inherit', textDecoration: 'none' },
        img: { display: 'block', maxWidth: '100%' },
        html: { overflowX: 'clip' },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: 'lg' },
      styleOverrides: { root: { paddingLeft: 'clamp(18px, 4vw, 44px)', paddingRight: 'clamp(18px, 4vw, 44px)' } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, minHeight: 50, paddingInline: 24, fontSize: '0.98rem' },
        sizeSmall: { minHeight: 42, paddingInline: 18, fontSize: '0.92rem' },
        containedSecondary: { '&:hover': { backgroundColor: goldLight } },
        outlined: { borderWidth: 1 },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 6 } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 10 } } },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { borderRadius: 10, border: `1px solid ${alpha(navy, 0.1)}` } },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 500 } } },
    MuiTextField: { defaultProps: { variant: 'filled', fullWidth: true } },
    MuiFilledInput: {
      defaultProps: { disableUnderline: true },
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: paper,
          border: `1px solid ${alpha(navy, 0.1)}`,
          '&:hover': { backgroundColor: paper },
          '&.Mui-focused': { backgroundColor: '#fff', borderColor: navy, boxShadow: `0 0 0 3px ${alpha(gold, 0.25)}` },
          '&.Mui-error': { borderColor: '#b3412b' },
        },
      },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0, square: true },
      styleOverrides: {
        root: { background: 'transparent', borderBottom: `1px solid ${alpha(navy, 0.18)}`, '&::before': { display: 'none' } },
      },
    },
    MuiAccordionSummary: { styleOverrides: { root: { paddingInline: 0, minHeight: 76 }, content: { margin: '18px 0' } } },
    MuiAccordionDetails: { styleOverrides: { root: { paddingInline: 0, paddingTop: 0, paddingBottom: 24 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none' } } },
    MuiFab: { styleOverrides: { root: { borderRadius: 8, boxShadow: 'none' } } },
    MuiDrawer: { styleOverrides: { paper: { backgroundColor: paper } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 6 } } },
  },
})

export const fonts = { display, body }

export default theme
