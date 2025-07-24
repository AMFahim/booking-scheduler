# Booking System API Documentation

## Overview
A complete booking system backend with conflict detection, buffer time handling, and comprehensive booking management features.

## Features
- ✅ 10-minute buffer time between bookings
- ✅ Duration validation (15 minutes minimum, 2 hours maximum)
- ✅ Conflict detection with proper buffer logic
- ✅ Booking status tracking (Upcoming, Ongoing, Past, Cancelled)
- ✅ Resource management
- ✅ Available slots calculation
- ✅ Grouped booking dashboard
- ✅ Soft cancellation

## API Endpoints

### Resources

#### GET `/api/bookings/resources`
Get all available resources.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Conference Room A",
    "description": "Large conference room with projector",
    "createdAt": "2025-07-24T10:00:00Z",
    "updatedAt": "2025-07-24T10:00:00Z"
  }
]
```

### Bookings

#### POST `/api/bookings`
Create a new booking.

**Request Body:**
```json
{
  "resource": "Conference Room A",
  "startTime": "2025-07-24T14:00:00Z",
  "endTime": "2025-07-24T15:00:00Z",
  "requestedBy": "John Doe"
}
```

**Validation Rules:**
- End time must be after start time
- Duration must be at least 15 minutes
- Duration cannot exceed 2 hours
- No conflicts with existing bookings (including 10-minute buffer)

**Response:**
```json
{
  "id": 1,
  "resource": "Conference Room A",
  "startTime": "2025-07-24T14:00:00Z",
  "endTime": "2025-07-24T15:00:00Z",
  "requestedBy": "John Doe",
  "status": "UPCOMING",
  "createdAt": "2025-07-24T10:00:00Z",
  "updatedAt": "2025-07-24T10:00:00Z"
}
```

#### GET `/api/bookings`
Get all bookings with optional filtering.

**Query Parameters:**
- `resource`: Filter by resource name
- `date`: Filter by date (YYYY-MM-DD format)
- `grouped`: Set to "true" to get bookings grouped by resource
- `requestedBy`: Filter by person who made the booking
- `sortBy`: Sort field (default: startTime)
- `sortType`: Sort direction (asc/desc, default: asc)
- `limit`: Results per page (default: 10)
- `page`: Page number (default: 1)

**Examples:**
```
GET /api/bookings?resource=Conference Room A&date=2025-07-24
GET /api/bookings?grouped=true
GET /api/bookings?sortBy=startTime&sortType=desc
```

**Response (Normal):**
```json
[
  {
    "id": 1,
    "resource": "Conference Room A",
    "startTime": "2025-07-24T14:00:00Z",
    "endTime": "2025-07-24T15:00:00Z",
    "requestedBy": "John Doe",
    "status": "UPCOMING"
  }
]
```

**Response (Grouped):**
```json
{
  "Conference Room A": [
    {
      "id": 1,
      "resource": "Conference Room A",
      "startTime": "2025-07-24T14:00:00Z",
      "endTime": "2025-07-24T15:00:00Z",
      "requestedBy": "John Doe",
      "status": "UPCOMING"
    }
  ],
  "Conference Room B": [...]
}
```

#### GET `/api/bookings/:bookingId`
Get a specific booking by ID.

#### PUT `/api/bookings/:bookingId`
Update a booking (same validation rules as creation).

#### DELETE `/api/bookings/:bookingId`
Permanently delete a booking.

#### PUT `/api/bookings/:bookingId/cancel`
Cancel a booking (soft delete - sets status to CANCELLED).

### Available Slots

#### GET `/api/bookings/available-slots`
Get available time slots for a resource on a specific date.

**Query Parameters:**
- `resource`: Resource name (required)
- `date`: Date in YYYY-MM-DD format (required)  
- `duration`: Slot duration in minutes (default: 30)

**Example:**
```
GET /api/bookings/available-slots?resource=Conference Room A&date=2025-07-24&duration=60
```

**Response:**
```json
[
  {
    "startTime": "2025-07-24T09:00:00Z",
    "endTime": "2025-07-24T10:00:00Z",
    "duration": 60
  },
  {
    "startTime": "2025-07-24T10:15:00Z",
    "endTime": "2025-07-24T11:15:00Z",
    "duration": 60
  }
]
```

## Buffer Time Logic

The system implements a 10-minute buffer before and after each booking to prevent back-to-back conflicts.

### Example Scenario:
If Conference Room A is booked from **2:00 PM** to **3:00 PM**, the system blocks **1:50 PM** to **3:10 PM**.

**Conflict Examples:**
- ❌ `12:55 PM – 1:55 PM` → Rejected (overlaps buffer before)
- ❌ `1:50 PM – 2:50 PM` → Rejected (overlaps buffer before)  
- ❌ `2:15 PM – 3:00 PM` → Rejected (overlaps with existing booking)
- ❌ `3:00 PM – 4:00 PM` → Rejected (overlaps buffer after)
- ✅ `3:15 PM – 4:00 PM` → Allowed (starts after full buffer)
- ✅ `11:00 AM – 1:45 PM` → Allowed (ends before buffer starts)

## Status Logic

Booking statuses are automatically calculated based on current time:

- **UPCOMING**: Start time is in the future
- **ONGOING**: Current time is between start and end time
- **PAST**: End time has passed
- **CANCELLED**: Booking has been cancelled (soft delete)

## Database Setup

1. Add the Prisma models to your schema
2. Run migrations: `npm run db:migrate`
3. Seed sample resources: `npm run db:seed`

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (booking conflicts)
- `500`: Internal Server Error

All errors return a consistent format:
```json
{
  "statusCode": 400,
  "message": "End time must be after start time"
}
```
