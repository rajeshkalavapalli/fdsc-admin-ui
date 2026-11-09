import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import ForgotPassword from './Pages/ForgotPassword'
import Enquiries from './Pages/Enquiries'
import { isSignedIn } from './configurations/session'

/* Pages behind sign-in: without a valid session, go to /login (and come back afterwards). */
function Protected({ children }) {
  const location = useLocation()
  if (!isSignedIn()) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {import.meta.env.VITE_ENABLE_FORGOT_PASSWORD === 'true' && (
        <Route path="/forgot-password" element={isSignedIn() ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
      )}
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/enquiries" element={<Protected><Enquiries /></Protected>} />
      <Route path="*" element={<Navigate to={isSignedIn() ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
