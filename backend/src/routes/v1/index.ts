import express from 'express';
import bookingRoute from './booking.route';
import docsRoute from './docs.route';
import config from '../../config/config';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/',
    route: express.Router().get('/', (req, res) => res.send('API is running'))
  },
  {
    path: '/bookings',
    route: bookingRoute
  },
  {
    path: '/resources',
    route: bookingRoute
  },
  {
    path: '/available-slots',
    route: bookingRoute
  }
];

const devRoutes = [
  {
    path: '/docs',
    route: docsRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
