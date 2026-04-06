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
    const bookingIds = [...this.bookingIds];
    const results = await Promise.all(
      bookingIds.map(async (bookingId) => {
        const response = await client.deleteBookingWithFallback(bookingId, {
          token: authToken,
        });

        if (![201, 404, 405].includes(response.status)) {
          throw new Error(
            `Unexpected cleanup status for booking ${bookingId}: ${response.status}`,
          );
        }

        this.untrackBooking(bookingId);
      }),
    );

    return results;
  }
}

module.exports = CleanupRegistry;
