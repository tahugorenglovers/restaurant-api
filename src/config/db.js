const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI belum diatur di file .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB terhubung: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('Gagal terhubung ke MongoDB:', err.message);
    process.exit(1);
  }
};
