require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  const server = app.listen(PORT, () =>
    console.log(`Server berjalan di http://localhost:${PORT}`)
  );

  const shutdown = async (signal) => {
    console.log(`\n${signal} diterima, mematikan server...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
})();
