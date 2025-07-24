import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getResources, 
  getBookings, 
  createBooking, 
  cancelBooking,
  getAvailableSlots,
  BookingFilters,
  CreateBookingRequest,
  AvailableSlotsQuery
} from '@/lib/api/booking';
import { Booking, Resource } from '@/types/booking';

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getResources();
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return { resources, loading, error, refetch: fetchResources };
};

export const useBookings = (initialFilters: BookingFilters = {}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [groupedBookings, setGroupedBookings] = useState<Record<string, Booking[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(() => initialFilters, [JSON.stringify(initialFilters)]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (filters.grouped) {
        const data = await getBookings({ ...filters, grouped: true });
        setGroupedBookings(data as Record<string, Booking[]>);
        
        const flatBookings = Object.values(data as Record<string, Booking[]>).flat();
        setBookings(flatBookings);
      } else {
        const data = await getBookings(filters);
        setBookings(data as Booking[]);
        setGroupedBookings({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
      
      setBookings([]);
      setGroupedBookings({});
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!error || bookings.length === 0) {
      fetchBookings();
    }
  }, [fetchBookings, error, bookings.length]);

  const createNewBooking = async (bookingData: CreateBookingRequest) => {
    try {
      const newBooking = await createBooking(bookingData);
      await fetchBookings();
      return newBooking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const cancelExistingBooking = async (id: number) => {
    try {
      await cancelBooking(id);
      await fetchBookings();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(errorMessage);
      return false;
    }
  };

  return {
    bookings,
    groupedBookings,
    loading,
    error,
    refetch: fetchBookings,
    createBooking: createNewBooking,
    cancelBooking: cancelExistingBooking,
  };
};

export const useAvailableSlots = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableSlots = useCallback(async (query: AvailableSlotsQuery) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAvailableSlots(query);
      setSlots(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available slots';
      setError(errorMessage);
      console.error('Error fetching available slots:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    slots,
    loading,
    error,
    fetchAvailableSlots,
  };
};