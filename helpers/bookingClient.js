const request = require('../config/request');
const env = require('../config/env');

class BookingClient {
  async deleteBookingRobust(bookingId, options = {}) {
    const firstResponse = await this.deleteBooking(bookingId, options);

    if ([201, 404, 405].includes(firstResponse.status)) {
      return firstResponse;
    }

    if (options.useBasicAuth) {
      return firstResponse;
    }

    if ([403, 500, 502, 503, 504].includes(firstResponse.status)) {
      const fallbackResponse = await this.deleteBooking(bookingId, {
        useBasicAuth: true,
      });

      if ([201, 404, 405].includes(fallbackResponse.status)) {
        return fallbackResponse;
      }

      return fallbackResponse;
    }

    return firstResponse;
  }

  ping() {
    return request.get('/ping');
  }

  listBookings(params = {}) {
    return request.get('/booking').query(params);
  }

  getBooking(bookingId) {
    return request.get(`/booking/${bookingId}`).set('Accept', 'application/json');
  }

  getBookingAsXml(bookingId) {
    return request.get(`/booking/${bookingId}`).set('Accept', 'application/xml');
  }

  createBooking(payload) {
    return request
      .post('/booking')
      .set('Accept', 'application/json')
      .send(payload);
  }

  createMalformedBookingJson() {
    return request
      .post('/booking')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send('{');
  }

  createPlainTextBooking(bodyText) {
    return request
      .post('/booking')
      .set('Content-Type', 'text/plain')
      .set('Accept', 'application/json')
      .send(bodyText);
  }

  updateBooking(bookingId, payload, options = {}) {
    return this.authorizedRequest('put', `/booking/${bookingId}`, options)
      .set('Accept', 'application/json')
      .send(payload);
  }

  patchBooking(bookingId, payload, options = {}) {
    return this.authorizedRequest('patch', `/booking/${bookingId}`, options)
      .set('Accept', 'application/json')
      .send(payload);
  }

  deleteBooking(bookingId, options = {}) {
    return this.authorizedRequest('delete', `/booking/${bookingId}`, options).set(
      'Accept',
      'application/json',
    );
  }

  authorizedRequest(method, path, options = {}) {
    const req = request[method](path);

    if (options.token) {
      return req.set('Cookie', `token=${options.token}`);
    }

    if (options.useBasicAuth) {
      return req.auth(env.bookerUsername, env.bookerPassword);
    }

    return req;
  }
}

module.exports = new BookingClient();
