class CleanupRegistry {
  constructor() {
    this.bookingIds = new Set();
  }

  trackBooking(bookingId) {
    this.bookingIds.add(bookingId);
  }

  untrackBooking(bookingId) {
    this.bookingIds.delete(bookingId);
  }

  async cleanup(client, authToken) {
    for (const bookingId of this.bookingIds) {
      const response = await client.deleteBooking(bookingId, { token: authToken });

      if (![201, 404, 405].includes(response.status)) {
        throw new Error(
          `Unexpected cleanup status for booking ${bookingId}: ${response.status}`,
        );
      }
    }
  }
}

module.exports = CleanupRegistry;
