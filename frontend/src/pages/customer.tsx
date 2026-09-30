import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { useAuth } from '../auth';
import { Loading, Notice } from '../components/Layout';
import type { Event, Order, Reservation, TicketType } from '../types/api';

const errorMessage = (error: unknown) => error instanceof ApiError ? error.message : 'Unable to reach the API. Please try again.';
const formatDate = (value: string) => new Date(value).toLocaleString();

export function CustomerDashboard() {
  const [events, setEvents] = useState<Event[]>([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { api.events().then(setEvents).catch(e => setError(errorMessage(e))).finally(() => setLoading(false)); }, []);
  return <><div className="page-heading"><div><p className="eyebrow">Discover</p><h1>Find your next event</h1><p className="muted">Browse events and see live ticket availability before you reserve.</p></div><div className="quick-links"><Link className="button secondary" to="/customer/reservations">My reservations</Link><Link className="button secondary" to="/customer/orders">My orders</Link></div></div>{error && <Notice>{error}</Notice>}{loading ? <Loading /> : events.length === 0 ? <div className="empty">No events are available yet. Check back soon.</div> : <div className="card-grid">{events.map(event => <article className="card" key={event.id}><p className="eyebrow">Live ticket availability</p><h2>{event.name}</h2><p className="muted">See ticket types, prices, and remaining tickets.</p><Link className="button" to={`/customer/events/${event.id}`}>View event</Link></article>)}</div>}</>;
}

export function EventDetails() {
  const { id = '' } = useParams(); const { session } = useAuth(); const [event, setEvent] = useState<Event | null>(null); const [tickets, setTickets] = useState<TicketType[]>([]); const [quantities, setQuantities] = useState<Record<number, number>>({}); const [reservation, setReservation] = useState<{ item: Reservation; ticket: TicketType } | null>(null); const [order, setOrder] = useState<Order | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  useEffect(() => { Promise.all([api.event(id), api.ticketTypes(id)]).then(([loadedEvent, loadedTickets]) => { setEvent(loadedEvent); setTickets(loadedTickets); }).catch(e => setError(errorMessage(e))).finally(() => setLoading(false)); }, [id]);
  async function reserve(ticket: TicketType) { const quantity = quantities[ticket.id] ?? 1; setBusy(true); setError(''); try { const item = await api.reserve(id, ticket.id, quantity, session!.token); setReservation({ item, ticket }); setOrder(null); setTickets(current => current.map(t => t.id === ticket.id ? { ...t, availableQuantity: t.availableQuantity - quantity } : t)); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  async function purchase() { if (!reservation) return; setBusy(true); setError(''); try { setOrder(await api.purchase(reservation.item.id, session!.token)); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }
  if (loading) return <Loading />;
  if (!event) return <><Notice>{error || 'Event not found.'}</Notice><Link to="/customer">Back to events</Link></>;
  return <><Link className="back-link" to="/customer">← All events</Link><div className="page-heading"><div><p className="eyebrow">Event</p><h1>{event.name}</h1><p className="muted">Select tickets and reserve them for 15 minutes.</p></div></div>{error && <Notice>{error}</Notice>}<section className="ticket-list">{tickets.length === 0 ? <div className="empty">This event does not have ticket types yet.</div> : tickets.map(ticket => <article className="ticket-row" key={ticket.id}><div><h2>{ticket.name}</h2><p className="muted">{ticket.availableQuantity} of {ticket.totalQuantity} tickets available</p></div><strong>₹{ticket.price}</strong><label className="quantity">Qty<input type="number" min="1" max={Math.max(ticket.availableQuantity, 1)} disabled={ticket.availableQuantity === 0 || busy} value={quantities[ticket.id] ?? 1} onChange={e => setQuantities(q => ({ ...q, [ticket.id]: Number(e.target.value) }))} /></label><button disabled={busy || ticket.availableQuantity === 0} onClick={() => reserve(ticket)}>{ticket.availableQuantity === 0 ? 'Sold out' : 'Reserve'}</button></article>)}</section>{reservation && <section className="confirmation"><p className="eyebrow">Reservation created</p><h2>Your tickets are held</h2><p><strong>Reservation #{reservation.item.id}</strong> · {reservation.item.quantity} × {reservation.ticket.name} · ₹{reservation.ticket.price * reservation.item.quantity}</p><p className="muted">Complete purchase before {formatDate(reservation.item.expiresAt)}.</p>{order ? <div className="success-panel"><h3>Purchase successful</h3><p>Order #{order.id} · {order.quantity} ticket(s) · ₹{order.totalAmount}</p><Link className="button" to="/customer/orders">View my orders</Link></div> : <button disabled={busy} onClick={purchase}>{busy ? 'Processing…' : 'Purchase reservation'}</button>}</section>}</>;
}

export function MyReservations() {
  const { session } = useAuth(); const [items, setItems] = useState<Reservation[]>([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { api.myReservations(session!.token).then(setItems).catch(e => setError(errorMessage(e))).finally(() => setLoading(false)); }, [session]);
  return <><div className="page-heading"><div><p className="eyebrow">Customer account</p><h1>My reservations</h1></div></div>{error && <Notice>{error}</Notice>}{loading ? <Loading /> : items.length === 0 ? <div className="empty">You have no reservations yet.</div> : <div className="stack">{items.map(item => <article className="card reservation-card" key={item.id}><div><span className={`status ${item.status.toLowerCase()}`}>{item.status}</span><h2>{item.ticketType?.event?.name ?? 'Event'} — {item.ticketType?.name ?? 'Ticket'}</h2><p>{item.quantity} ticket(s) · Expires {formatDate(item.expiresAt)}</p></div><strong>Reservation #{item.id}</strong></article>)}</div>}</>;
}

export function MyOrders() {
  const { session } = useAuth(); const [items, setItems] = useState<Order[]>([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { api.myOrders(session!.token).then(setItems).catch(e => setError(errorMessage(e))).finally(() => setLoading(false)); }, [session]);
  return <><div className="page-heading"><div><p className="eyebrow">Customer account</p><h1>My orders</h1></div></div>{error && <Notice>{error}</Notice>}{loading ? <Loading /> : items.length === 0 ? <div className="empty">No purchases yet. Your completed orders will appear here.</div> : <div className="stack">{items.map(item => <article className="card reservation-card" key={item.id}><div><p className="eyebrow">Order #{item.id}</p><h2>{item.reservation?.ticketType?.event?.name ?? 'Event'} — {item.reservation?.ticketType?.name ?? 'Ticket'}</h2><p>{item.quantity} ticket(s) · Purchased {formatDate(item.createdAt)}</p></div><strong>₹{item.totalAmount}</strong></article>)}</div>}</>;
}
