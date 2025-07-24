import { Booking, Resource } from '@/types/booking';
import axiosInstance from '@/utils/axiosInstance';

export interface CreateBookingRequest {
  resource: string;
  startTime: string;
  endTime: string;
  requestedBy: string;
}

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

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

export interface AvailableSlotsQuery {
  resource: string;
  date: string;
  duration?: number;
}

// Get all resources
export const getResources = async (): Promise<Resource[]> => {
  try {
    const response = await axiosInstance.get('/bookings/resources');
    return response.data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

// Create a new booking
export const createBooking = async (bookingData: CreateBookingRequest): Promise<Booking> => {
  try {
    const response = await axiosInstance.post('/bookings', bookingData);
    return response.data;
  } catch (error:any) {
    console.error('Error creating booking:', error);
    const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    'Failed to create booking';
    throw errorMessage;
  }
};

export const getBookings = async (filters: BookingFilters = {}): Promise<Booking[] | Record<string, Booking[]>> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.resource) params.append('resource', filters.resource);
    if (filters.date) params.append('date', filters.date);
    if (filters.grouped) params.append('grouped', 'true');
    if (filters.requestedBy) params.append('requestedBy', filters.requestedBy);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortType) params.append('sortType', filters.sortType);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const response = await axiosInstance.get(`/bookings?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const getBookingById = async (id: number): Promise<Booking> => {
  try {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

export const updateBooking = async (id: number, bookingData: Partial<CreateBookingRequest>): Promise<Booking> => {
  try {
    const response = await axiosInstance.put(`/bookings/${id}`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

// Cancel a booking (soft delete)
export const cancelBooking = async (id: number): Promise<Booking> => {
  try {
    const response = await axiosInstance.put(`/bookings/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Delete a booking (hard delete)
export const deleteBooking = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/bookings/${id}`);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

// Get available time slots
export const getAvailableSlots = async (query: AvailableSlotsQuery): Promise<AvailableSlot[]> => {
  try {
    const params = new URLSearchParams({
      resource: query.resource,
      date: query.date,
    });
    
    if (query.duration) {
      params.append('duration', query.duration.toString());
    }

    const response = await axiosInstance.get(`/bookings/available-slots?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw error;
  }
};

//  get bookings grouped by resource
export const getBookingsGroupedByResource = async (filters: Omit<BookingFilters, 'grouped'> = {}): Promise<Record<string, Booking[]>> => {
  const result = await getBookings({ ...filters, grouped: true });
  return result as Record<string, Booking[]>;
};

// get bookings for a specific resource and date
export const getBookingsByResourceAndDate = async (resource?: string, date?: string): Promise<Booking[]> => {
  const result = await getBookings({ resource, date });
  return result as Booking[];
};