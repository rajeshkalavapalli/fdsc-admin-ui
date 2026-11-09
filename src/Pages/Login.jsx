import { useMemo, useState } from 'react'
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Checkbox, Collapse, FormControlLabel, IconButton, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import api, { errorMessage } from '../configurations/api'
import { isSignedIn, saveSession } from '../configurations/session'
import AuthShell, { fieldIcon, mmss, placeholderField, useCountdown } from '../components/AuthShell'

const REMEMBER_KEY = 'fdscAdminRememberUser'
// Forgot password (OTP by SMS) is built but switched off until an SMS provider is set up.
// Turn on with VITE_ENABLE_FORGOT_PASSWORD=true in .env.
const FORGOT_ENABLED = import.meta.env.VITE_ENABLE_FORGOT_PASSWORD === 'true'

const readRemembered = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) || ''
  } catch {
    return ''
  }
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const remembered = useMemo(readRemembered, [])
  const [userName, setUserName] = useState(remembered)
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(Boolean(remembered))
  const [show, setShow] = useState(false)
  const [caps, setCaps] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const lock = useCountdown() // server-side lockout: 15-minute block shown as a live countdown
  const notice = location.state?.notice || ''

  if (isSignedIn()) return <Navigate to="/dashboard" replace />

  const onKey = (e) => setCaps(Boolean(e.getModifierState?.('CapsLock')))
  const blocked = lock.left > 0

  async function onSubmit(e) {
    e.preventDefault()
    if (blocked) return
    setError('')
    if (!userName.trim() || !password) {
      setError('Enter your username and password.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/login', { userName: userName.trim(), password })
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, userName.trim())
        else localStorage.removeItem(REMEMBER_KEY)
      } catch { /* storage blocked */ }
      saveSession(data)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      const wait = err.response?.data?.retryAfterSeconds
      if (err.response?.status === 429 && wait) lock.start(wait)
      setError(errorMessage(err, 'Could not sign in. Please try again.'))
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to the FDSC admin console" onSubmit={onSubmit}>
      <Collapse in={Boolean(notice) && !error}>
        <Alert severity="success" sx={{ mb: 2.5 }}>{notice}</Alert>
      </Collapse>
      <Collapse in={Boolean(error)}>
        <Alert severity={blocked ? 'warning' : 'error'} icon={blocked ? <TimerOutlinedIcon /> : undefined} sx={{ mb: 2.5 }}>
          {blocked ? (
            <>
              <Box component="span" sx={{ display: 'block', fontWeight: 600 }}>Sign-in temporarily blocked</Box>
              For your security, try again in <b>{mmss(lock.left)}</b>.
            </>
          ) : (
            error
          )}
        </Alert>
      </Collapse>

      <Stack spacing={1.75}>
        <TextField
          hiddenLabel
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          autoComplete="username"
          disabled={blocked}
          sx={placeholderField}
          slotProps={{ input: fieldIcon(<PersonOutlineIcon fontSize="small" />), htmlInput: { 'aria-label': 'Username' } }}
        />
        <TextField
          hiddenLabel
          placeholder="Password"
          type={show ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={onKey}
          onKeyDown={onKey}
          autoComplete="current-password"
          disabled={blocked}
          sx={placeholderField}
          slotProps={{
            htmlInput: { 'aria-label': 'Password' },
            input: {
              ...fieldIcon(<LockOutlinedIcon fontSize="small" />),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} edge="end" size="small">
                    {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      <Collapse in={caps}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 1.25, color: 'warning.dark', fontSize: 13 }}>
          <KeyboardCapslockIcon sx={{ fontSize: 16 }} /> <span>Caps Lock is on</span>
        </Stack>
      </Collapse>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <FormControlLabel
          control={<Checkbox size="small" checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
          label={<Typography variant="body2" color="text.secondary">Remember username</Typography>}
          sx={{ ml: -0.75 }}
        />
        {FORGOT_ENABLED && (
        <Link component={RouterLink} to="/forgot-password" state={{ userName: userName.trim() }} underline="hover" sx={{ fontSize: 14, fontWeight: 600, color: 'secondary.dark' }}>
          Forgot password?
        </Link>
        )}
      </Stack>

      <Button type="submit" fullWidth variant="contained" size="large" loading={loading} disabled={blocked} endIcon={blocked ? <TimerOutlinedIcon /> : <ArrowForwardIcon />} sx={{ mt: 1.5, minHeight: 50, fontSize: 16 }}>
        {blocked ? `Try again in ${mmss(lock.left)}` : 'Sign in'}
      </Button>
    </AuthShell>
  )
}
