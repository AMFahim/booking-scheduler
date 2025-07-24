import { Booking, AvailableSlot } from '@/types/booking';

export function getBookingStatus(startTime: string, endTime: string): 'UPCOMING' | 'ONGOING' | 'PAST' {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) {
    return 'UPCOMING';
  } else if (now >= start && now <= end) {
    return 'ONGOING';
  } else {
    return 'PAST';
  }
}

export function hasConflict(
  newStart: string,
  newEnd: string,
  resource: string,
  bookings: Booking[],
  excludeId?: number
): boolean {
  const newStartTime = new Date(newStart);
  const newEndTime = new Date(newEnd);

  const resourceBookings = bookings.filter(
    (booking) => booking.resource === resource && booking.id !== excludeId
  );

  for (const booking of resourceBookings) {
    const existingStart = new Date(booking.startTime);
    const existingEnd = new Date(booking.endTime);

    // Add 10-minute buffer (in milliseconds)
    const bufferMs = 10 * 60 * 1000;
    const bufferedStart = new Date(existingStart.getTime() - bufferMs);
    const bufferedEnd = new Date(existingEnd.getTime() + bufferMs);

    // Check for overlap with buffered time
    if (newStartTime < bufferedEnd && newEndTime > bufferedStart) {
      return true;
    }
  }

  return false;
}

export function validateBookingTime(startTime: string, endTime: string): string[] {
  const errors: string[] = [];
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (start <= now) {
    errors.push('Start time must be in the future');
  }

  if (end <= start) {
    errors.push('End time must be after start time');
  }

  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = durationMs / (1000 * 60);

  if (durationMinutes < 15) {
    errors.push('Booking duration must be at least 15 minutes');
  }

  if (durationMinutes > 120) {
    errors.push('Booking duration cannot exceed 2 hours');
  }

  return errors;
}

export function groupBookingsByResource(bookings: Booking[]): { [resource: string]: Booking[] } {
  return bookings.reduce((groups, booking) => {
    if (!groups[booking.resource]) {
      groups[booking.resource] = [];
    }
    groups[booking.resource].push(booking);
    return groups;
  }, {} as { [resource: string]: Booking[] });
}

export function generateAvailableSlots(
  resource: string,
  date: string,
  bookings: Booking[]
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const targetDate = new Date(date);
  
  // Business hours: 9 AM to 6 PM
  const startHour = 9;
  const endHour = 18;
  
  const resourceBookings = bookings
    .filter(booking => {
      const bookingDate = new Date(booking.startTime);
      return booking.resource === resource && 
             bookingDate.toDateString() === targetDate.toDateString();
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  let currentTime = new Date(targetDate);
  currentTime.setHours(startHour, 0, 0, 0);

  const endTime = new Date(targetDate);
  endTime.setHours(endHour, 0, 0, 0);

  for (const booking of resourceBookings) {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);
    
    // Add 10-minute buffer
    const bufferMs = 10 * 60 * 1000;
    const bufferedStart = new Date(bookingStart.getTime() - bufferMs);
    const bufferedEnd = new Date(bookingEnd.getTime() + bufferMs);

    // If there's time before this booking
    if (currentTime < bufferedStart) {
      const slotEnd = new Date(Math.min(bufferedStart.getTime(), endTime.getTime()));
      const duration = (slotEnd.getTime() - currentTime.getTime()) / (1000 * 60);
      
      if (duration >= 15) {
        slots.push({
          startTime: currentTime.toISOString(),
          endTime: slotEnd.toISOString(),
          duration: Math.floor(duration)
        });
      }
    }

    currentTime = new Date(Math.max(bufferedEnd.getTime(), currentTime.getTime()));
  }

  // Check for remaining time after last booking
  if (currentTime < endTime) {
    const duration = (endTime.getTime() - currentTime.getTime()) / (1000 * 60);
    if (duration >= 15) {
      slots.push({
        startTime: currentTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: Math.floor(duration)
      });
    }
  }

  return slots;
}

export function formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDate(dateTime: string): string {
  return new Date(dateTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}