import Joi from 'joi';

const createBooking = {
  body: Joi.object().keys({
    resource: Joi.string().required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().required(),
    requestedBy: Joi.string().required()
  })
};

const getBookings = {
  query: Joi.object().keys({
    resource: Joi.string(),
    date: Joi.date().iso(),
    requestedBy: Joi.string(),
    sortBy: Joi.string(),
    sortType: Joi.string().valid('asc', 'desc'),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getBooking = {
  params: Joi.object().keys({
    bookingId: Joi.number().integer().required()
  })
};

const updateBooking = {
  params: Joi.object().keys({
    bookingId: Joi.number().integer().required()
  }),
  body: Joi.object()
    .keys({
      resource: Joi.string(),
      startTime: Joi.date().iso(),
      endTime: Joi.date().iso(),
      requestedBy: Joi.string()
    })
    .min(1)
};

const deleteBooking = {
  params: Joi.object().keys({
    bookingId: Joi.number().integer().required()
  })
};

export default {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking
};
