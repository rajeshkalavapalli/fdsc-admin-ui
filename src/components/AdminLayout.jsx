import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppBar, Badge, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { clearSession, getAdmin } from '../configurations/session'
import { fonts } from '../Theme/theme'
import api from '../configurations/api'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/enquiries', label: 'Enquiries', badge: true },
]

/* Count of enquiries still marked "New"; refreshed every minute so staff notice new ones. */
function useNewCount() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let alive = true
    const load = () => api.get('/enquiries/summary').then(({ data }) => alive && setCount(data.byStatus?.New || 0)).catch(() => {})
    load()
    const timer = setInterval(load, 60000)
    window.addEventListener('fdsc:enquiries-changed', load)
    return () => { alive = false; clearInterval(timer); window.removeEventListener('fdsc:enquiries-changed', load) }
  }, [])
  useEffect(() => {
    document.title = count ? `(${count}) FDSC Admin` : 'FDSC Admin'
  }, [count])
  return count
}

/* Top bar + page container shared by every signed-in page. */
export default function AdminLayout({ children, admin }) {
  const navigate = useNavigate()
  const who = admin || getAdmin()
  const newCount = useNewCount()

  const signOut = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100svh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} color="primary">
        <Container>
          <Toolbar disableGutters sx={{ gap: { xs: 1, sm: 2 } }}>
            <Box component="img" src="/fdsc-logo.png" alt="" sx={{ width: 36, height: 36, borderRadius: '50%' }} />
            <Typography sx={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 20, mr: { xs: 1, sm: 3 }, display: { xs: 'none', sm: 'block' } }}>FDSC Admin</Typography>
            <Stack direction="row" spacing={0.5} sx={{ mr: 'auto' }}>
              {links.map((l) => (
                <Button
                  key={l.to}
                  component={NavLink}
                  to={l.to}
                  color="inherit"
                  sx={{ minHeight: 40, pr: l.badge && newCount ? 3 : 1, opacity: 0.75, '&.active': { opacity: 1, bgcolor: 'rgba(255,255,255,.1)' } }}
                >
                  {l.badge && newCount ? (
                    <Badge badgeContent={newCount} max={99} color="secondary" sx={{ '& .MuiBadge-badge': { right: -12, top: 2, color: 'primary.main', fontWeight: 700 } }}>
                      {l.label}
                    </Badge>
                  ) : l.label}
                </Button>
              ))}
            </Stack>
            <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' }, color: 'brand.onNavy2' }}>{who?.name}</Typography>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={signOut} sx={{ minWidth: 0 }}>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Sign out</Box>
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Container sx={{ py: { xs: 3, md: 5 } }}>{children}</Container>
    </Box>
  )
}
