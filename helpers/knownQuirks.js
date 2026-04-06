function expectNotFound(response) {
  expect([404, 405]).toContain(response.status);
}

module.exports = {
  expectNotFound,
};
