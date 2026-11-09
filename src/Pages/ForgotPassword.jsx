import { useRef, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Collapse, IconButton, InputAdornment, Link, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import api, { errorMessage } from '../configurations/api'
import AuthShell, { fieldIcon, mmss, placeholderField, useCountdown } from '../components/AuthShell'
import { fonts } from '../Theme/theme'

const STEPS = ['Username', 'Verify OTP', 'New password']

/* Six single-digit boxes: auto-advance, backspace to previous, paste the whole code. */
function OtpBoxes({ value, onChange, disabled }) {
  const refs = useRef([])
  const digits = value.padEnd(6, ' ').slice(0, 6).split('')

  const setAt = (i, d) => {
    const next = digits.map((c, k) => (k === i ? d : c)).join('').replace(/ /g, '')
    onChange(next.slice(0, 6))
  }
  const onKeyDown = (i) => (e) => {
    if (e.key === 'Backspace' && !digits[i].trim() && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
  }
  const onInput = (i) => (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(-1)
    setAt(i, d || ' ')
    if (d && i < 5) refs.current[i + 1]?.focus()
  }
  const onPaste = (e) => {
    const code = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!code) return
    e.preventDefault()
    onChange(code)
    refs.current[Math.min(code.length, 5)]?.focus()
  }

  return (
    <Stack direction="row" spacing={{ xs: 0.75, sm: 1.25 }} sx={{ justifyContent: 'center' }} onPaste={onPaste}>
      {digits.map((d, i) => (
        <Box
          key={i}
          component="input"
          ref={(el) => (refs.current[i] = el)}
          value={d.trim()}
          onChange={onInput(i)}
          onKeyDown={onKeyDown(i)}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`OTP digit ${i + 1}`}
          maxLength={1}
          sx={{
            width: { xs: 44, sm: 52 },
            height: { xs: 54, sm: 60 },
            textAlign: 'center',
            fontFamily: fonts.display,
            fontSize: 26,
            fontWeight: 600,
            color: 'primary.main',
            bgcolor: 'brand.paper',
            border: '1px solid',
            borderColor: d.trim() ? 'secondary.main' : 'divider',
            borderRadius: 1.5,
            outline: 'none',
            transition: 'border-color .2s, box-shadow .2s',
            '&:focus': { borderColor: 'primary.main', boxShadow: '0 0 0 3px rgba(201,160,78,.25)', bgcolor: '#fff' },
          }}
        />
      ))}
    </Stack>
  )
}

const rule = (ok, text) => (
  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', fontSize: 13, color: ok ? 'success.main' : 'text.disabled' }}>
    {ok ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />}
    <span>{text}</span>
  </Stack>
)

export default function ForgotPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(0)
  const [userName, setUserName] = useState(location.state?.userName || '')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const lock = useCountdown() // server block (too many requests / wrong OTPs)
  const resend = useCountdown() // wait before asking for another OTP

  const blocked = lock.left > 0
  const fail = (err, fallback) => {
    const wait = err.response?.data?.retryAfterSeconds
    if (err.response?.status === 429 && wait) {
      // A short wait is the resend cooldown; a long one is a security block.
      if (wait <= 120 && step === 1) resend.start(wait)
      else lock.start(wait)
    }
    setError(errorMessage(err, fallback))
  }

  const sendOtp = async () => {
    setError('')
    setInfo('')
    if (!userName.trim()) {
      setError('Enter your username.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/forgot-password', { userName: userName.trim() })
      setInfo(data.message)
      resend.start(data.resendAfterSeconds || 60)
      setOtp('')
      setStep(1)
    } catch (err) {
      fail(err, 'Could not send the OTP. Please try again.')
    }
    setLoading(false)
  }

  const verifyOtp = async () => {
    setError('')
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/verify-otp', { userName: userName.trim(), otp })
      setResetToken(data.resetToken)
      setInfo('')
      setStep(2)
    } catch (err) {
      setOtp('')
      fail(err, 'Could not check the OTP. Please try again.')
    }
    setLoading(false)
  }

  const strong = { length: password.length >= 10, letter: /[a-z]/i.test(password), digit: /\d/.test(password), match: password.length > 0 && password === confirm }
  const resetPassword = async () => {
    setError('')
    if (!strong.length || !strong.letter || !strong.digit) {
      setError('Use at least 10 characters, with at least one letter and one digit.')
      return
    }
    if (!strong.match) {
      setError("The passwords don't match.")
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/reset-password', { resetToken, password })
      navigate('/login', { replace: true, state: { notice: data.message } })
    } catch (err) {
      fail(err, 'Could not change the password. Please try again.')
      setLoading(false)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (blocked || loading) return
    ;[sendOtp, verifyOtp, resetPassword][step]()
  }

  const titles = [
    ['Forgot password?', "Enter your username and we'll send an OTP to your registered mobile."],
    ['Verify OTP', 'Enter the 6-digit code sent to your registered mobile number.'],
    ['Set a new password', 'Choose a strong password you have not used before.'],
  ]

  return (
    <AuthShell title={titles[step][0]} subtitle={titles[step][1]} onSubmit={onSubmit} footnote="OTP valid 10 minutes · 5 tries · requests are recorded">
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3, '& .MuiStepLabel-label': { fontSize: 12, mt: '6px !important' }, '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': { color: 'secondary.main' } }}>
        {STEPS.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
      </Stepper>

      <Collapse in={Boolean(info) && !error}>
        <Alert severity="info" icon={<SmsOutlinedIcon />} sx={{ mb: 2.5 }}>{info}</Alert>
      </Collapse>
      <Collapse in={Boolean(error)}>
        <Alert severity={blocked ? 'warning' : 'error'} icon={blocked ? <TimerOutlinedIcon /> : undefined} sx={{ mb: 2.5 }}>
          {blocked ? <>Temporarily blocked for your security. Try again in <b>{mmss(lock.left)}</b>.</> : error}
        </Alert>
      </Collapse>

      {step === 0 && (
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
      )}

      {step === 1 && (
        <>
          <OtpBoxes value={otp} onChange={setOtp} disabled={blocked} />
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Link component="button" type="button" underline="hover" onClick={() => { setStep(0); setError(''); setInfo('') }} sx={{ fontSize: 13.5, color: 'text.secondary', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <ArrowBackIcon sx={{ fontSize: 15 }} /> Change username
            </Link>
            {resend.left > 0 ? (
              <Typography variant="body2" color="text.disabled">Resend OTP in {mmss(resend.left)}</Typography>
            ) : (
              <Link component="button" type="button" underline="hover" onClick={sendOtp} disabled={blocked || loading} sx={{ fontSize: 13.5, fontWeight: 600, color: 'secondary.dark' }}>
                Resend OTP
              </Link>
            )}
          </Stack>
        </>
      )}

      {step === 2 && (
        <Stack spacing={1.5}>
          <TextField
            hiddenLabel
            placeholder="New password"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            sx={placeholderField}
            slotProps={{
              htmlInput: { 'aria-label': 'New password' },
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
          <TextField
            hiddenLabel
            placeholder="Confirm new password"
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            sx={placeholderField}
            slotProps={{ input: fieldIcon(<LockOutlinedIcon fontSize="small" />), htmlInput: { 'aria-label': 'Confirm new password' } }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, pt: 0.5 }}>
            {rule(strong.length, 'At least 10 characters')}
            {rule(strong.letter, 'Contains a letter')}
            {rule(strong.digit, 'Contains a digit')}
            {rule(strong.match, 'Passwords match')}
          </Box>
        </Stack>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        loading={loading}
        disabled={blocked}
        endIcon={blocked ? <TimerOutlinedIcon /> : <ArrowForwardIcon />}
        sx={{ mt: 3, minHeight: 54, fontSize: 16 }}
      >
        {blocked ? `Try again in ${mmss(lock.left)}` : ['Send OTP', 'Verify OTP', 'Change password'][step]}
      </Button>

      <Typography variant="body2" sx={{ textAlign: 'center', mt: 2.5, color: 'text.secondary' }}>
        Remembered it?{' '}
        <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600, color: 'secondary.dark' }}>Back to sign in</Link>
      </Typography>
    </AuthShell>
  )
}
