import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Alert, Box, Button, Card, Chip, Divider, Drawer, IconButton, InputAdornment, MenuItem, Snackbar, Stack, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, Tabs, TextField, Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import RefreshIcon from '@mui/icons-material/Refresh'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import api, { errorMessage } from '../configurations/api'
import { COURSE_LABELS, STATUSES, STATUS_COLORS, formatDate } from '../configurations/enquiries'
import AdminLayout from '../components/AdminLayout'

function StatusChip({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.New
  return <Chip size="small" label={status} sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 600 }} />
}

const waLink = (phone, name) =>
  `https://wa.me/91${phone}?text=${encodeURIComponent(`Hello ${name}, this is FDSC (Firdaws Distance Study Center) regarding your enquiry.`)}`

/* Side panel: full enquiry, contact buttons, status and notes. */
function EnquiryDrawer({ enquiry, onClose, onSaved }) {
  const [status, setStatus] = useState(enquiry?.Status || 'New')
  const [notes, setNotes] = useState(enquiry?.Notes || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [repeats, setRepeats] = useState([])

  useEffect(() => {
    setStatus(enquiry?.Status || 'New')
    setNotes(enquiry?.Notes || '')
    setError('')
    setRepeats([])
    if (enquiry?.EnquiryCount > 1) {
      api.get(`/enquiries/${enquiry.EnquiryId}/repeats`).then(({ data }) => setRepeats(data.items)).catch(() => {})
    }
  }, [enquiry])

  if (!enquiry) return null
  const save = async () => {
    setSaving(true)
    setError('')
    try {
      await api.patch(`/enquiries/${enquiry.EnquiryId}`, { status, notes })
      window.dispatchEvent(new Event('fdsc:enquiries-changed'))
      onSaved()
    } catch (err) {
      setError(errorMessage(err, 'Could not save. Please try again.'))
    }
    setSaving(false)
  }

  const row = (label, value) =>
    value ? (
      <Box sx={{ mb: 1.75 }}>
        <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>{label}</Typography>
        <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{value}</Typography>
      </Box>
    ) : null

  return (
    <Drawer anchor="right" open={Boolean(enquiry)} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 }, p: 3 } } }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4">{enquiry.Name}</Typography>
          <Typography variant="body2" color="text.secondary">Enquiry #{enquiry.EnquiryId} · {formatDate(enquiry.CreatedOn)}</Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button variant="contained" startIcon={<PhoneOutlinedIcon />} href={`tel:+91${enquiry.Phone}`}>Call</Button>
        <Button variant="outlined" startIcon={<WhatsAppIcon />} href={waLink(enquiry.Phone, enquiry.Name)} target="_blank" rel="noreferrer">WhatsApp</Button>
      </Stack>

      {row('Mobile', `+91 ${enquiry.Phone}`)}
      {row('Email', enquiry.Email)}
      {row('Course', COURSE_LABELS[enquiry.Course] || enquiry.Course)}
      {row('Last qualification', enquiry.Qualification)}
      {row('Message', enquiry.Message)}
      {enquiry.EnquiryCount > 1 && (
        <Box sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: 'brand.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Enquired {enquiry.EnquiryCount} times · latest {formatDate(enquiry.LastEnquiryOn)}
          </Typography>
          <Stack spacing={1.5} divider={<Divider flexItem />}>
            {repeats.map((r) => (
              <Box key={r.RepeatId}>
                <Typography variant="caption" color="text.disabled">
                  {formatDate(r.CreatedOn)} · {COURSE_LABELS[r.Course] || r.Course}{r.Name !== enquiry.Name ? ` · as "${r.Name}"` : ''}
                </Typography>
                {r.Qualification && <Typography variant="body2" color="text.secondary">{r.Qualification}</Typography>}
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{r.Message || <em>No message</em>}</Typography>
              </Box>
            ))}
            <Box>
              <Typography variant="caption" color="text.disabled">{formatDate(enquiry.CreatedOn)} · first enquiry (details above)</Typography>
            </Box>
          </Stack>
        </Box>
      )}
      {row('Consent', enquiry.ConsentOn ? `Agreed to the Privacy Notice on ${formatDate(enquiry.ConsentOn)}` : null)}

      <Divider sx={{ my: 2.5 }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack spacing={2}>
        <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <TextField label="Notes (only admins see these)" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={3} slotProps={{ htmlInput: { maxLength: 1000 } }} />
        <Button variant="contained" size="large" loading={saving} onClick={save}>Save</Button>
        {enquiry.UpdatedOn && (
          <Typography variant="caption" color="text.disabled">
            Last updated {formatDate(enquiry.UpdatedOn)}{enquiry.UpdatedByName ? ` by ${enquiry.UpdatedByName}` : ''}
          </Typography>
        )}
      </Stack>
    </Drawer>
  )
}

/* CSV that opens cleanly in Excel: UTF-8 BOM, quoted cells, and cells starting with = + - @
   prefixed with ' so a malicious enquiry can't run as a spreadsheet formula. */
const csvCell = (value) => {
  let v = value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`
  return `"${v.replace(/"/g, '""')}"`
}

function downloadCsv(rows) {
  const header = ['Enquiry #', 'First received', 'Latest enquiry', 'Times enquired', 'Name', 'Mobile', 'Email', 'Course', 'Last qualification', 'Message', 'Status', 'Notes', 'Consent given', 'Last updated', 'Updated by']
  const lines = rows.map((e) => [
    e.EnquiryId, formatDate(e.CreatedOn), formatDate(e.LastEnquiryOn || e.CreatedOn), e.EnquiryCount || 1, e.Name, e.Phone, e.Email, COURSE_LABELS[e.Course] || e.Course, e.Qualification,
    e.Message, e.Status, e.Notes, e.ConsentOn ? formatDate(e.ConsentOn) : '', e.UpdatedOn ? formatDate(e.UpdatedOn) : '', e.UpdatedByName,
  ].map(csvCell).join(','))
  const blob = new Blob(['\ufeff' + [header.map(csvCell).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: `fdsc-enquiries-${new Date().toISOString().slice(0, 10)}.csv` })
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function Enquiries() {
  const [params, setParams] = useSearchParams()
  const status = STATUSES.includes(params.get('status')) ? params.get('status') : ''
  const course = COURSE_LABELS[params.get('course')] ? params.get('course') : ''
  const [search, setSearch] = useState(params.get('search') || '')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [data, setData] = useState({ items: [], total: 0 })
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(null)
  const [toast, setToast] = useState('')
  const [exporting, setExporting] = useState(false)

  // Exports every enquiry that matches the current tab, course and search (not just this page).
  const exportCsv = async () => {
    setExporting(true)
    setError('')
    try {
      const filters = { status: status || undefined, course: course || undefined, search: params.get('search') || undefined, pageSize: 100 }
      const rows = []
      for (let p = 1; ; p += 1) {
        const { data: chunk } = await api.get('/enquiries', { params: { ...filters, page: p } })
        rows.push(...chunk.items)
        if (rows.length >= chunk.total || !chunk.items.length) break
      }
      downloadCsv(rows)
      setToast(`Exported ${rows.length} ${rows.length === 1 ? 'enquiry' : 'enquiries'}.`)
    } catch (err) {
      setError(errorMessage(err, 'Could not export enquiries.'))
    }
    setExporting(false)
  }

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
    setPage(0)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [list, sum] = await Promise.all([
        api.get('/enquiries', { params: { status: status || undefined, course: course || undefined, search: params.get('search') || undefined, page: page + 1, pageSize } }),
        api.get('/enquiries/summary'),
      ])
      setData(list.data)
      setSummary(sum.data)
    } catch (err) {
      setError(errorMessage(err, 'Could not load enquiries.'))
    }
    setLoading(false)
  }, [status, course, params, page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  // Search as you type, after a short pause.
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('search') || '') !== search.trim()) setFilter('search', search.trim())
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const count = (s) => (summary ? (s ? summary.byStatus[s] : summary.total) : '')

  return (
    <AdminLayout>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, mb: 3 }}>
        <Box>
          <Typography variant="h2">Enquiries</Typography>
          <Typography color="text.secondary">Enquiries sent from the website form{summary ? ` · ${summary.today} today` : ''}.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={exportCsv} loading={exporting} disabled={!data.total}>Export CSV</Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
        </Stack>
      </Stack>

      <Card>
        <Tabs value={status} onChange={(_, v) => setFilter('status', v)} variant="scrollable" scrollButtons={false} sx={{ px: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          {['', ...STATUSES].map((s) => (
            <Tab key={s || 'all'} value={s} label={`${s || 'All'} ${count(s) !== '' ? `(${count(s)})` : ''}`} />
          ))}
        </Tabs>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ p: 2 }}>
          <TextField
            placeholder="Search name, mobile or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            hiddenLabel
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            sx={{ flex: 1, minWidth: 0, '& .MuiFilledInput-root': { minHeight: 48 } }}
          />
          <TextField select label="Course" value={course} onChange={(e) => setFilter('course', e.target.value)} sx={{ width: { xs: '100%', sm: 220 }, flex: 'none' }}>
            <MenuItem value="">All courses</MenuItem>
            {Object.entries(COURSE_LABELS).map(([id, label]) => <MenuItem key={id} value={id}>{label}</MenuItem>)}
          </TextField>
        </Stack>

        {error && <Alert severity="error" sx={{ mx: 2, mb: 2 }}>{error}</Alert>}

        <TableContainer>
          <Table size="medium" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, color: 'text.secondary', bgcolor: 'brand.paper' } }}>
                <TableCell>Latest enquiry</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Qualification</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((e) => (
                <TableRow key={e.EnquiryId} hover onClick={() => setOpen(e)} sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                    {formatDate(e.LastEnquiryOn || e.CreatedOn)}
                    {e.EnquiryCount > 1 && (
                      <Chip size="small" label={`×${e.EnquiryCount}`} title={`Enquired ${e.EnquiryCount} times`} sx={{ ml: 1, height: 20, fontWeight: 700, bgcolor: 'secondary.light', color: 'primary.main' }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{e.Name}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <span>{e.Phone}</span>
                      <IconButton size="small" href={waLink(e.Phone, e.Name)} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()} aria-label="WhatsApp" sx={{ color: '#1f9d55' }}>
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>{COURSE_LABELS[e.Course] || e.Course}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{e.Qualification || '-'}</TableCell>
                  <TableCell><StatusChip status={e.Status} /></TableCell>
                </TableRow>
              ))}
              {!loading && data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 8, textAlign: 'center', color: 'text.secondary', borderBottom: 0 }}>
                    <InboxOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', display: 'block', mx: 'auto', mb: 1 }} />
                    No enquiries {status || course || params.get('search') ? 'match these filters' : 'yet'}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data.total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0) }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>

      <EnquiryDrawer enquiry={open} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); setToast('Enquiry updated'); load() }} />
      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast('')} message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </AdminLayout>
  )
}
