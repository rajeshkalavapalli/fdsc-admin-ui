import { useEffect, useState } from 'react'
import { Box, InputAdornment, Link, Paper, Stack, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import { fonts } from '../Theme/theme'

const SITE_URL = import.meta.env.VITE_SITE_URL || '/'
const BG = 'https://images.unsplash.com/photo-1719408937898-e15b8638e1d8?auto=format&fit=crop&w=2000&q=70'

const greetingFor = (h) => (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')

/* Placeholder-style fields: the word shows inside an empty field and disappears on click. */
export const placeholderField = {
  '& .MuiFilledInput-root': { minHeight: 56 },
  '& input::placeholder': { color: 'text.secondary', opacity: 1, transition: 'opacity .15s' },
  '& input:focus::placeholder': { opacity: 0 },
}
export const fieldIcon = (icon) => ({ startAdornment: <InputAdornment position="start" sx={{ color: 'text.disabled' }}>{icon}</InputAdornment> })

/* Seconds left until a server lock ends, ticking down once a second. */
export function useCountdown() {
  const [until, setUntil] = useState(0)
  const [left, setLeft] = useState(0)
  useEffect(() => {
    if (!until) return undefined
    const tick = () => {
      const s = Math.max(0, Math.ceil((until - Date.now()) / 1000))
      setLeft(s)
      if (!s) setUntil(0)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [until])
  return { left, start: (seconds) => setUntil(Date.now() + seconds * 1000) }
}
export const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/* Shared layout for sign-in and forgot-password pages: cinematic photo, greeting, card. */
export default function AuthShell({ title, subtitle, onSubmit, children, footnote = 'Secure session · signs out after 8 hours · sign-ins are recorded' }) {
  const now = new Date()
  const today = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Box sx={{ position: 'relative', minHeight: '100svh', height: { md: '100svh' }, overflowX: 'hidden', overflowY: { xs: 'visible', md: 'auto' }, isolation: 'isolate', bgcolor: 'primary.main', color: '#fff' }}>
      {/* Background layer: clipped, so the slow zoom never adds scroll */}
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden' }}>
      <Box
        component="img"
        src={BG}
        alt=""
        sx={{
          position: 'absolute', inset: 0, zIndex: -2, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 35%',
          animation: 'bg-drift 24s ease-in-out infinite alternate',
          '@keyframes bg-drift': { from: { transform: 'scale(1.04)' }, to: { transform: 'scale(1.14) translateX(-1.5%)' } },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      />
      <Box
        sx={{
          position: 'absolute', inset: 0, zIndex: -1,
          background: {
            xs: 'linear-gradient(180deg, rgba(11,26,51,.78) 0%, rgba(11,26,51,.92) 55%, #0b1a33 100%)',
            md: 'linear-gradient(100deg, rgba(7,17,31,.94) 0%, rgba(11,26,51,.82) 42%, rgba(11,26,51,.55) 70%, rgba(11,26,51,.75) 100%)',
          },
        }}
      />
      </Box>

      <Box
        sx={{
          minHeight: { xs: '100svh', md: '100%' }, height: { md: '100%' }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' }, gridTemplateRows: { xs: 'auto 1fr auto', md: '1fr' },
          gap: { xs: 4, md: 6 }, px: { xs: 2.5, sm: 5, lg: 10 }, py: { xs: 3, md: 4.5 }, maxWidth: 1440, mx: 'auto',
          // Short laptop screens: tighter spacing so the page fits without scrolling.
          '@media (max-height: 760px)': { py: { md: 2.5 } },
        }}
      >
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box component="img" src="/fdsc-logo.png" alt="" sx={{ width: 44, height: 44, borderRadius: '50%', boxShadow: '0 0 0 1px rgba(201,160,78,.6)' }} />
            <Box>
              <Typography sx={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 21, lineHeight: 1.1 }}>FDSC</Typography>
              <Typography sx={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'secondary.light' }}>Admin console</Typography>
            </Box>
          </Stack>

          <Box sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 560 }}>
            <Typography sx={{ fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', color: 'secondary.light', mb: 2 }}>{today}</Typography>
            <Typography sx={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 'clamp(3rem, 5.4vw, 5.25rem)', lineHeight: 1, letterSpacing: '-.02em' }}>
              {greetingFor(now.getHours())}.
            </Typography>
            <Typography sx={{ fontFamily: fonts.display, fontStyle: 'italic', fontWeight: 600, fontSize: 'clamp(1.6rem, 2.6vw, 2.4rem)', color: 'secondary.main', mt: 1 }}>
              Your Future. Our Support.
            </Typography>
            <Typography sx={{ mt: 3, maxWidth: 440, color: 'brand.onNavy2', fontSize: 17 }}>
              Every enquiry you answer here is a student taking the next step. Sign in to manage enquiries and website content.
            </Typography>
          </Box>

          <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', color: 'brand.onNavy2' }}>
            <Typography variant="caption">Firdaws Distance Study Center · Kasipeta, Venkatagiri</Typography>
            <Link href={SITE_URL} underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13, color: 'inherit', '&:hover': { color: '#fff' } }}>
              <ArrowBackIcon sx={{ fontSize: 15 }} /> Back to website
            </Link>
          </Stack>
        </Stack>

        <Box sx={{ display: 'grid', placeItems: { xs: 'start center', md: 'center end' } }}>
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 440, pt: '36px' }}>
            <Box
              component="img"
              src="/fdsc-logo.png"
              alt="FDSC"
              sx={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 2, width: 72, height: 72, borderRadius: '50%',
                boxShadow: '0 0 0 6px #fbfaf6, 0 0 0 7px rgba(201,160,78,.55), 0 18px 40px -12px rgba(0,0,0,.6)',
              }}
            />
            <Paper
              component="form"
              onSubmit={onSubmit}
              noValidate
              elevation={0}
              sx={{
                position: 'relative', pt: 6.5, px: { xs: 3, sm: 4.5 }, pb: { xs: 3, sm: 3.5 }, '@media (max-height: 760px)': { pt: 5.5, pb: 2.5 }, borderRadius: 2, bgcolor: '#fbfaf6', color: 'text.primary',
                borderTop: '3px solid', borderColor: 'secondary.main', boxShadow: '0 40px 90px -30px rgba(0,0,0,.75)',
                animation: 'card-in .9s cubic-bezier(.2,.8,.2,1) both',
                '@keyframes card-in': { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'none' } },
              }}
            >
              <Typography variant="h3" sx={{ textAlign: 'center', fontSize: { xs: 30, sm: 34 } }}>{title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 0.75, mb: 3, '@media (max-height: 760px)': { mb: 2 } }}>{subtitle}</Typography>

              {children}

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2.5, pt: 2, '@media (max-height: 760px)': { mt: 2, pt: 1.5 }, borderTop: '1px solid', borderColor: 'divider', color: 'text.disabled' }}>
                <VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: 'secondary.dark' }} />
                <Typography variant="caption">{footnote}</Typography>
              </Stack>
            </Paper>

            <Link href={SITE_URL} underline="hover" sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 2.5, fontSize: 14, color: 'brand.onNavy2', '&:hover': { color: '#fff' } }}>
              <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to website
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
