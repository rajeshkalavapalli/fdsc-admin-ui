import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Alert, Box, Button, Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import api, { errorMessage } from '../configurations/api'
import { getAdmin } from '../configurations/session'
import { STATUS_COLORS } from '../configurations/enquiries'
import AdminLayout from '../components/AdminLayout'
import { fonts } from '../Theme/theme'

function Stat({ label, value, color, to }) {
  return (
    <Card component={to ? RouterLink : 'div'} to={to} sx={{ height: '100%', textDecoration: 'none', transition: 'border-color .2s', '&:hover': to ? { borderColor: 'secondary.main' } : {} }}>
      <CardContent sx={{ p: 2.75 }}>
        <Typography variant="overline" sx={{ color: color || 'text.secondary' }}>{label}</Typography>
        <Typography sx={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 40, lineHeight: 1.1, color: 'text.primary' }}>
          {value ?? <Skeleton width={50} />}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [admin, setAdmin] = useState(getAdmin())
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/me').then(({ data }) => setAdmin(data.admin)).catch((err) => setError(errorMessage(err, 'Could not load your account.')))
    api.get('/enquiries/summary').then(({ data }) => setSummary(data)).catch((err) => setError(errorMessage(err, 'Could not load the enquiry summary.')))
  }, [])

  return (
    <AdminLayout admin={admin}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Typography variant="h2" sx={{ mb: 1 }}>Welcome{admin?.name ? `, ${admin.name}` : ''}</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {admin?.lastLoginOn ? `Last sign-in: ${new Date(admin.lastLoginOn).toLocaleString('en-IN')}` : 'You are signed in to the FDSC admin panel.'}
      </Typography>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <InboxOutlinedIcon sx={{ color: 'secondary.dark' }} />
          <Typography variant="h4">Enquiries</Typography>
        </Stack>
        <Button component={RouterLink} to="/enquiries" endIcon={<ArrowForwardIcon />} variant="contained">Open enquiries</Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 2.4 }}><Stat label="Today" value={summary?.today} color="secondary.dark" to="/enquiries" /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><Stat label="All" value={summary?.total} to="/enquiries" /></Grid>
        {['New', 'Contacted', 'Admitted'].map((s) => (
          <Grid key={s} size={{ xs: 4, md: 2.4 }}>
            <Stat label={s} value={summary?.byStatus?.[s]} color={STATUS_COLORS[s].fg} to={`/enquiries?status=${encodeURIComponent(s)}`} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 2.5, borderRadius: 2, bgcolor: 'brand.paper2', color: 'text.secondary', fontSize: 14 }}>
        Courses and FAQs management are coming next.
      </Box>
    </AdminLayout>
  )
}
