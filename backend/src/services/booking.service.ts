import { Booking, BookingStatus, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/ApiError';

/**
 * Create a booking
 * @param {Object} bookingData
 * @returns {Promise<Booking>}
 */
const createBooking = async (
  resource: string,
  startTime: Date,
  endTime: Date,
  requestedBy: string
): Promise<Booking> => {
  if (endTime <= startTime) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'End time must be after start time');
  }

  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  if (durationMinutes < 15) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Booking duration must be at least 15 minutes');
  }

  if (durationMinutes > 120) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Booking duration cannot exceed 2 hours');
  }

  const bufferMinutes = 10;
  const bufferStartTime = new Date(startTime.getTime() - bufferMinutes * 60 * 1000);
  const bufferEndTime = new Date(endTime.getTime() + bufferMinutes * 60 * 1000);

  const conflictingBookings = await prisma.booking.findMany({
    where: {
      resource,
      status: { not: BookingStatus.CANCELLED }, 
      AND: [
        {
          OR: [
            {
              startTime: {
                gte: bufferStartTime,
                lt: bufferEndTime
              }
            },
            {
              endTime: {
                gt: bufferStartTime,
                lte: bufferEndTime
              }
            },
            {
              AND: [{ startTime: { lte: bufferStartTime } }, { endTime: { gte: bufferEndTime } }]
            }
          ]
        }
      ]
    }
  });

  if (conflictingBookings.length > 0) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Time slot conflicts with existing booking (including 10-minute buffer)'
    );
  }

  return prisma.booking.create({
    data: {
      resource,
      startTime,
      endTime,
      requestedBy
    }
  });
};

/**
 * Query for bookings
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<Booking[]>}
 */
const queryBookings = async (
  filter: Prisma.BookingWhereInput,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  } = {}
): Promise<Booking[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy ?? 'startTime';
  const sortType = options.sortType ?? 'asc';

  const bookings = await prisma.booking.findMany({
    where: filter,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortType }
  });

  return bookings;
};

/**
 * Get booking by id
 * @param {string} id
 * @returns {Promise<Booking | null>}
 */
const getBookingById = async (id: string): Promise<Booking | null> => {
  return prisma.booking.findUnique({
    where: { id }
  });
};

/**
 * Update booking by id
 * @param {string} bookingId
 * @param {Object} updateBody
 * @returns {Promise<Booking>}
 */
const updateBookingById = async (
  bookingId: string,
  updateBody: Prisma.BookingUpdateInput
): Promise<Booking> => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  if (updateBody.startTime || updateBody.endTime) {
    const newStartTime = (updateBody.startTime as Date) || booking.startTime;
    const newEndTime = (updateBody.endTime as Date) || booking.endTime;

    if (newEndTime <= newStartTime) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'End time must be after start time');
    }

    const durationMinutes = (newEndTime.getTime() - newStartTime.getTime()) / (1000 * 60);
    if (durationMinutes < 15) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Booking duration must be at least 15 minutes');
    }

    const bufferMinutes = 10;
    const bufferStartTime = new Date(newStartTime.getTime() - bufferMinutes * 60 * 1000);
    const bufferEndTime = new Date(newEndTime.getTime() + bufferMinutes * 60 * 1000);

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        resource: (updateBody.resource as string) || booking.resource,
        id: { not: bookingId },
        AND: [
          {
            OR: [
              {
                startTime: {
                  gte: bufferStartTime,
                  lt: bufferEndTime
                }
              },
              {
                endTime: {
                  gt: bufferStartTime,
                  lte: bufferEndTime
                }
              },
              {
                AND: [{ startTime: { lte: bufferStartTime } }, { endTime: { gte: bufferEndTime } }]
              }
            ]
          }
        ]
      }
    });

    if (conflictingBookings.length > 0) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Updated time slot conflicts with existing booking (including 10-minute buffer)'
      );
    }
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: updateBody
  });
};

/**
 * Delete booking by id
 * @param {string} bookingId
 * @returns {Promise<Booking>}
 */
const deleteBookingById = async (bookingId: string): Promise<Booking> => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  await prisma.booking.delete({ where: { id: bookingId } });
  return booking;
};

/**
 * Get bookings by resource and date
 * @param {string} resource
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Booking[]>}
 */
const getBookingsByResourceAndDate = async (
  resource?: string,
  date?: string
): Promise<Booking[]> => {
  const filter: Prisma.BookingWhereInput = {};

  if (resource) {
    filter.resource = resource;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    filter.AND = [
      {
        startTime: {
          gte: startOfDay
        }
      },
      {
        startTime: {
          lte: endOfDay
        }
      }
    ];
  }

  return prisma.booking.findMany({
    where: filter,
    orderBy: { startTime: 'asc' }
  });
};

/**
 * Get all resources
 * @returns {Promise<Resource[]>}
 */
const getAllResources = async () => {
  return prisma.resource.findMany({
    orderBy: { name: 'asc' }
  });
};

/**
 * Get bookings grouped by resource
 * @param {Object} filter
 * @returns {Promise<Object>}
 */
const getBookingsGroupedByResource = async (filter: { resource?: string; date?: string }) => {
  const whereClause: Prisma.BookingWhereInput = {
    status: { not: BookingStatus.CANCELLED }
  };

  if (filter.resource) {
    whereClause.resource = filter.resource;
  }

  if (filter.date) {
    const startOfDay = new Date(filter.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(filter.date);
    endOfDay.setHours(23, 59, 59, 999);

    whereClause.AND = [{ startTime: { gte: startOfDay } }, { startTime: { lte: endOfDay } }];
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    orderBy: { startTime: 'asc' }
  });

  // Add status based on current time
  const now = new Date();
  const bookingsWithStatus = bookings.map((booking) => {
    let status: BookingStatus;

    if (booking.endTime < now) {
      status = BookingStatus.PAST;
    } else if (booking.startTime <= now && booking.endTime > now) {
      status = BookingStatus.ONGOING;
    } else {
      status = BookingStatus.UPCOMING;
    }

    return { ...booking, status };
  });

  // Group by resource
  const groupedBookings = bookingsWithStatus.reduce((acc, booking) => {
    if (!acc[booking.resource]) {
      acc[booking.resource] = [];
    }
    acc[booking.resource].push(booking);
    return acc;
  }, {} as Record<string, typeof bookingsWithStatus>);

  return groupedBookings;
};

/**
 * Cancel a booking
 * @param {string} bookingId
 * @returns {Promise<Booking>}
 */
const cancelBooking = async (bookingId: string): Promise<Booking> => {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Booking is already cancelled');
  }

  if (booking.status === BookingStatus.PAST) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot cancel a past booking');
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED }
  });
};

/**
 * Get available time slots for a resource on a specific date
 * @param {string} resource
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} duration - Duration in minutes (default 30)
 * @returns {Promise<Object[]>}
 */
const getAvailableSlots = async (resource: string, date: string, duration = 30) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(9, 0, 0, 0); // Start at 9 AM

  const endOfDay = new Date(date);
  endOfDay.setHours(18, 0, 0, 0); // End at 6 PM

  const existingBookings = await prisma.booking.findMany({
    where: {
      resource,
      status: { not: BookingStatus.CANCELLED },
      AND: [
        { startTime: { lt: endOfDay } }, 
        { endTime: { gt: startOfDay } }  
      ]
    },
    orderBy: { startTime: 'asc' }
  });

  const availableSlots = [];
  const bufferMinutes = 10;
  const slotDuration = duration;

  let currentTime = new Date(startOfDay);

  while (currentTime < endOfDay) {
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);

    if (slotEnd > endOfDay) break;

    const slotStartWithBuffer = new Date(currentTime.getTime() - bufferMinutes * 60 * 1000);
    const slotEndWithBuffer = new Date(slotEnd.getTime() + bufferMinutes * 60 * 1000);

    const hasConflict = existingBookings.some((booking) => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      return !(slotEndWithBuffer <= bookingStart || slotStartWithBuffer >= bookingEnd);
    });

    if (!hasConflict) {
      availableSlots.push({
        startTime: new Date(currentTime),
        endTime: new Date(slotEnd),
        duration: slotDuration
      });
    }

    currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
  }

  return availableSlots;
};

export default {
  createBooking,
  queryBookings,
  getBookingById,
  updateBookingById,
  deleteBookingById,
  getBookingsByResourceAndDate,
  getAllResources,
  getBookingsGroupedByResource,
  cancelBooking,
  getAvailableSlots
};
