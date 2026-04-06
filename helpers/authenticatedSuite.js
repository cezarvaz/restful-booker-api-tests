const authClient = require('./authClient');
const bookingClient = require('./bookingClient');
const CleanupRegistry = require('./cleanupRegistry');

function useAuthenticatedSuite() {
  const cleanup = new CleanupRegistry();
  const state = {
    authToken: undefined,
    cleanup,
    trackBooking(bookingId) {
      cleanup.trackBooking(bookingId);
    },
    untrackBooking(bookingId) {
      cleanup.untrackBooking(bookingId);
    },
  };

  beforeAll(async () => {
    state.authToken = await authClient.getToken();
  });

  afterAll(async () => {
    await cleanup.cleanup(bookingClient, state.authToken);
  });

  return state;
}

module.exports = {
  useAuthenticatedSuite,
};
