// Labels and colours shared by the dashboard and the Enquiries page.
export const COURSE_LABELS = {
  'open-10th': 'Open 10th',
  'open-12th': 'Open 12th',
  intermediate: 'Intermediate',
  'open-degree': 'Open Degree',
}

export const STATUSES = ['New', 'Contacted', 'Admitted', 'Not interested']

export const STATUS_COLORS = {
  New: { bg: '#e8eefb', fg: '#1f4fbf' },
  Contacted: { bg: '#fdf3dc', fg: '#8a5a00' },
  Admitted: { bg: '#e3f3e8', fg: '#1d6b3c' },
  'Not interested': { bg: '#efefef', fg: '#5c5c5c' },
}

export const formatDate = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
