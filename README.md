# booking-scheduler

**Efficiently manage and book shared resources with intelligent conflict detection and buffer time management.**

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Overview

**booking-scheduler** is a flexible and intelligent scheduling system that helps you efficiently manage the booking of shared resources, such as meeting rooms, vehicles, or equipment. With built-in conflict detection and customizable buffer times between bookings, it ensures smooth resource allocation and avoids overbooking scenarios.

## Features

- **Resource Management**: Add and track multiple resources (e.g., rooms, cars, devices)
- **Booking Creation & Editing**: Book resources for specific time slots, modify bookings as needed
- **Conflict Detection**: Prevent overlapping bookings with instant feedback
- **Buffer Time Management**: Define minimum gaps between bookings to allow preparation or cleanup
- **Flexible API**: Integrate with your apps or backend with ease
- **Extensible Design**: Adaptable for different resource types and business logic

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Recommended: v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

Clone the repository:

```bash
git clone https://github.com/AMFahim/booking-scheduler.git
cd booking-scheduler
```

Install dependencies:

```bash
npm install
# or
yarn install
```

## Usage

You can use the booking scheduler as a module in your project or as a standalone service, depending on your requirements.

### Example: Scheduling a Resource

```js
const Scheduler = require('booking-scheduler');

// Initialize scheduler with your configuration
const scheduler = new Scheduler({
  bufferMinutes: 15, // buffer time between bookings
});

// Add a resource
scheduler.addResource('Room A');

// Book a resource
const startTime = new Date('2025-07-24T10:00:00');
const endTime = new Date('2025-07-24T11:00:00');
const booking = scheduler.book('Room A', startTime, endTime);

if (booking.success) {
  console.log('Booking created:', booking.details);
} else {
  console.log('Booking failed:', booking.error);
}
```

## Configuration

| Option         | Type    | Description                                |
|----------------|---------|--------------------------------------------|
| bufferMinutes  | Number  | Buffer time between consecutive bookings   |
| conflictCheck  | Boolean | Enable or disable conflict detection       |


[1] https://github.com/AMFahim/booking-scheduler
