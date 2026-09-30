export type Role = 'ORGANIZER' | 'CUSTOMER';

export interface Event {
  id: number;
  name: string;
}

export interface TicketType {
  id: number;
  name: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
}

export interface Reservation {
  id: number;
  quantity: number;
  status: 'ACTIVE' | 'PURCHASED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  ticketType?: TicketType & { event?: Event };
}

export interface Order {
  id: number;
  quantity: number;
  totalAmount: number;
  createdAt: string;
  reservation?: Reservation;
}

export interface Session {
  token: string;
  role: Role;
  userId: number;
  email: string;
}
