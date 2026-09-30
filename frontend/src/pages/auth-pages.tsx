import { FormEvent, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { useAuth } from '../auth';
import { Notice } from '../components/Layout';
import type { Role } from '../types/api';

function AuthCard({ title, children }: { title: string; children: ReactNode }) { return <div className="auth-page"><section className="auth-card"><Link className="brand" to="/">Ticmint <span>mini</span></Link><h1>{title}</h1>{children}</section></div>; }
const message = (error: unknown) => error instanceof ApiError ? error.message : 'Unable to reach the API. Check that the backend is running.';

export function Login() {
  const { login } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); try { const { access_token } = await api.login(email, password); const session = login(access_token); const from = (location.state as { from?: { pathname?: string } })?.from?.pathname; navigate(from ?? (session.role === 'ORGANIZER' ? '/organizer' : '/customer'), { replace: true }); } catch (err) { setError(message(err)); } finally { setBusy(false); } }
  return <AuthCard title="Welcome back"><p className="muted">Sign in to manage events or find your next ticket.</p>{error && <Notice>{error}</Notice>}<form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label><button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form><p className="muted">New here? <Link to="/register">Create an account</Link></p></AuthCard>;
}

export function Register() {
  const navigate = useNavigate(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [role, setRole] = useState<Role>('CUSTOMER'); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); try { await api.register(email, password, role); setSuccess('Account created. You can sign in now.'); setTimeout(() => navigate('/login'), 700); } catch (err) { setError(message(err)); } finally { setBusy(false); } }
  return <AuthCard title="Create your account"><p className="muted">Choose the experience you want to explore.</p>{error && <Notice>{error}</Notice>}{success && <Notice kind="success">{success}</Notice>}<form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required /></label><label>Account type<select value={role} onChange={e => setRole(e.target.value as Role)}><option value="CUSTOMER">Customer — find and buy tickets</option><option value="ORGANIZER">Organizer — create events</option></select></label><button disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button></form><p className="muted">Already have an account? <Link to="/login">Sign in</Link></p></AuthCard>;
}
