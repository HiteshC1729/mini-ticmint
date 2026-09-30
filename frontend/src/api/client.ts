import type { Event, Order, Reservation, Role, TicketType } from '../types/api';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new ApiError(message ?? 'Something went wrong. Please try again.', response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (email: string, password: string, role: Role) =>
    request<{ id: number; email: string; role: Role }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ email, password, role }),
    }),
  login: (email: string, password: string) =>
    request<{ access_token: string }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  events: () => request<Event[]>('/events'),
  myEvents: (token: string) => request<Event[]>('/events/my-events', {}, token),
  event: (id: string) => request<Event>(`/events/${id}`),
  ticketTypes: (eventId: string) => request<TicketType[]>(`/events/${eventId}/ticket-types`),
  createEvent: (name: string, token: string) => request<Event>('/events', {
    method: 'POST', body: JSON.stringify({ name }),
  }, token),
  updateEvent: (id: string, name: string, token: string) => request<Event>(`/events/${id}`, {
    method: 'PATCH', body: JSON.stringify({ name }),
  }, token),
  deleteEvent: (id: string, token: string) => request<{ message: string }>(`/events/${id}`, {
    method: 'DELETE',
  }, token),
  createTicketType: (eventId: string, data: Omit<TicketType, 'id' | 'availableQuantity'>, token: string) =>
    request<TicketType>(`/events/${eventId}/ticket-types`, {
      method: 'POST', body: JSON.stringify(data),
    }, token),
  reserve: (eventId: string, ticketTypeId: number, quantity: number, token: string) =>
    request<Reservation>(`/events/${eventId}/ticket-types/${ticketTypeId}/reservations`, {
      method: 'POST', body: JSON.stringify({ quantity }),
    }, token),
  purchase: (reservationId: number, token: string) =>
    request<Order>(`/events/reservations/${reservationId}/purchase`, { method: 'POST' }, token),
  myReservations: (token: string) => request<Reservation[]>('/events/my-reservations', {}, token),
  myOrders: (token: string) => request<Order[]>('/events/my-orders', {}, token),
};
