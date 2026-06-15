// Prisma returns JS Date objects for @db.Date columns; the legacy mock models
// returned plain "YYYY-MM-DD" strings. Convert on read so API responses keep
// the same date-only format.
const toDateOnly = (date) => (date ? date.toISOString().slice(0, 10) : date);

module.exports = { toDateOnly };
