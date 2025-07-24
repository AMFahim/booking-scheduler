import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { bookingService } from '../services';

const createBooking = catchAsync(async (req, res) => {
  const { resource, startTime, endTime, requestedBy } = req.body;

  // Validate required fields
  if (!resource || !startTime || !endTime || !requestedBy) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'All fields (resource, startTime, endTime, requestedBy) are required'
    );
  }

  const booking = await bookingService.createBooking(
    resource,
    new Date(startTime),
    new Date(endTime),
    requestedBy
  );

  res.status(httpStatus.CREATED).send(booking);
});

const getBookings = catchAsync(async (req, res) => {
  const { resource, date, grouped } = req.query;

  // If grouped=true, return bookings grouped by resource
  if (grouped === 'true') {
    const groupedBookings = await bookingService.getBookingsGroupedByResource({
      resource: resource as string,
      date: date as string
    });
    res.send(groupedBookings);
    return;
  }

  // If resource or date is provided, use specific query
  if (resource || date) {
    const bookings = await bookingService.getBookingsByResourceAndDate(
      resource as string,
      date as string
    );
    res.send(bookings);
    return;
  }

  // Otherwise use general query with pagination
  const filter = pick(req.query, ['resource', 'requestedBy']);
  const options = pick(req.query, ['sortBy', 'sortType', 'limit', 'page']);

  const bookings = await bookingService.queryBookings(filter, options);
  res.send(bookings);
});

const getBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking not found');
  }
  res.send(booking);
});

const updateBooking = catchAsync(async (req, res) => {
  const bookingId = req.params.bookingId;
  const updateData = { ...req.body };

  // Convert date strings to Date objects if provided
  if (updateData.startTime) {
    updateData.startTime = new Date(updateData.startTime);
  }
  if (updateData.endTime) {
    updateData.endTime = new Date(updateData.endTime);
  }

  const booking = await bookingService.updateBookingById(bookingId, updateData);
  res.send(booking);
});

const deleteBooking = catchAsync(async (req, res) => {
  const bookingId = req.params.bookingId;
  await bookingService.deleteBookingById(bookingId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getResources = catchAsync(async (req, res) => {
  const resources = await bookingService.getAllResources();
  res.send(resources);
});

const cancelBooking = catchAsync(async (req, res) => {
  const bookingId = req.params.bookingId;
  const booking = await bookingService.cancelBooking(bookingId);
  res.send(booking);
});

const getAvailableSlots = catchAsync(async (req, res) => {
  const { resource, date, duration } = req.query;

  if (!resource || !date) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Resource and date are required');
  }

  const slots = await bookingService.getAvailableSlots(
    resource as string,
    date as string,
    duration ? parseInt(duration as string) : 30
  );

  res.send(slots);
});

export default {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  getResources,
  cancelBooking,
  getAvailableSlots
};
