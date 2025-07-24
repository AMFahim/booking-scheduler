export interface Resource {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  resource: string;
  startTime: string;
  endTime: string;
  requestedBy: string;
  status: 'UPCOMING' | 'ONGOING' | 'PAST' | 'CANCELLED'; // Added CANCELLED status
}

export enum BookingStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  PAST = 'PAST',
  CANCELLED = 'CANCELLED'
}

export interface BookingFormData {
  resource: string;
  startTime: string;
  endTime: string;
  requestedBy: string;
}

// Add this interface to match your API's CreateBookingRequest
export interface CreateBookingRequest {
  resource: string;
  startTime: string;
  endTime: string;
  requestedBy: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

export interface GroupedBookings {
  [resource: string]: Booking[];
}

// Add filter interfaces if they're being used in components
export interface BookingFilters {
  resource?: string;
  date?: string;
  grouped?: boolean;
  requestedBy?: string;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface AvailableSlotsQuery {
  resource: string;
  date: string;
  duration?: number;
}