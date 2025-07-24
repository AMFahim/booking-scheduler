import express from 'express';
import { bookingController } from '../../controllers';

const router = express.Router();

// GET /api/resources - Get all available resources
router.get('/resources', bookingController.getResources);

// GET /api/available-slots - Get available time slots
router.get('/available-slots', bookingController.getAvailableSlots);

// POST /api/bookings - Create a new booking
router.post('/', bookingController.createBooking);

// GET /api/bookings - Get all bookings with optional filters
// Supports: ?resource=X&date=YYYY-MM-DD&grouped=true
router.get('/', bookingController.getBookings);

// GET /api/bookings/:bookingId - Get a specific booking
router.get('/:bookingId', bookingController.getBooking);

// PUT /api/bookings/:bookingId - Update a booking
router.put('/:bookingId', bookingController.updateBooking);

// DELETE /api/bookings/:bookingId - Delete a booking (hard delete)
router.delete('/:bookingId', bookingController.deleteBooking);

// PUT /api/bookings/:bookingId/cancel - Cancel a booking (soft delete)
router.put('/:bookingId/cancel', bookingController.cancelBooking);

export default router;
