const env = {
  bookerBaseUrl:
    process.env.RESTFUL_BOOKER_BASE_URL || 'https://restful-booker.herokuapp.com',
  bookerUsername: process.env.RESTFUL_BOOKER_USERNAME || 'admin',
  bookerPassword: process.env.RESTFUL_BOOKER_PASSWORD || 'password123',
};

module.exports = env;
