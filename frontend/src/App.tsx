import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './auth';
import { Layout } from './components/Layout';
import { CustomerDashboard, EventDetails, MyOrders, MyReservations } from './pages/customer';
import { Login, Register } from './pages/auth-pages';
import { ManageEvent, OrganizerDashboard } from './pages/organizer';
import type { Role } from './types/api';

function HomeRedirect() { const { session } = useAuth(); return <Navigate to={session ? (session.role === 'ORGANIZER' ? '/organizer' : '/customer') : '/login'} replace />; }

function Protected({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useAuth();
  const location = useLocation();
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />;
  if (session.role !== role) return <Navigate to={session.role === 'ORGANIZER' ? '/organizer' : '/customer'} replace />;
  return <>{children}</>;
}

export default function App() {
  return <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
    <Route element={<Layout />}>
      <Route path="/customer" element={<Protected role="CUSTOMER"><CustomerDashboard /></Protected>} />
      <Route path="/customer/events/:id" element={<Protected role="CUSTOMER"><EventDetails /></Protected>} />
      <Route path="/customer/reservations" element={<Protected role="CUSTOMER"><MyReservations /></Protected>} />
      <Route path="/customer/orders" element={<Protected role="CUSTOMER"><MyOrders /></Protected>} />
      <Route path="/organizer" element={<Protected role="ORGANIZER"><OrganizerDashboard /></Protected>} />
      <Route path="/organizer/events/:id" element={<Protected role="ORGANIZER"><ManageEvent /></Protected>} />
    </Route>
    <Route path="*" element={<HomeRedirect />} />
  </Routes>;
}
