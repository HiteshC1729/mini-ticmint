import { Link, NavLink, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth';

export function Layout() {
  const { session, logout } = useAuth();
  const base = session?.role === 'ORGANIZER' ? '/organizer' : '/customer';
  return <div className="app-shell">
    <header><Link className="brand" to={base}>Ticmint <span>mini</span></Link>
      {session && <nav>
        <NavLink to={base}>Dashboard</NavLink>
        {session.role === 'CUSTOMER' && <><NavLink to="/customer/reservations">My reservations</NavLink><NavLink to="/customer/orders">My orders</NavLink></>}
        <button className="text-button" onClick={logout}>Log out</button>
      </nav>}
    </header>
    <main><Outlet /></main>
  </div>;
}

export function Notice({ children, kind = 'error' }: { children: ReactNode; kind?: 'error' | 'success' }) {
  return <p className={`notice ${kind}`}>{children}</p>;
}

export function Loading() { return <p className="muted">Loading…</p>; }
