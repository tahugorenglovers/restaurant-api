require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');

const menu = [
  { name: 'Nasi Goreng Spesial', description: 'Nasi goreng dengan telur, ayam, dan acar', price: 35000, category: 'makanan' },
  { name: 'Mie Goreng Seafood', description: 'Mie goreng dengan udang dan cumi', price: 42000, category: 'makanan' },
  { name: 'Ayam Bakar Madu', description: 'Ayam bakar saus madu, nasi, lalapan', price: 45000, category: 'makanan' },
  { name: 'Sate Ayam (10 tusuk)', description: 'Sate ayam bumbu kacang + lontong', price: 38000, category: 'makanan' },
  { name: 'Es Teh Manis', description: 'Teh manis dingin', price: 8000, category: 'minuman' },
  { name: 'Jus Alpukat', description: 'Jus alpukat dengan coklat', price: 20000, category: 'minuman' },
  { name: 'Es Cendol', description: 'Cendol santan gula merah', price: 15000, category: 'dessert' },
  { name: 'Pisang Goreng Keju', description: 'Pisang goreng dengan keju & susu', price: 18000, category: 'snack' },
];

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), MenuItem.deleteMany({})]);

  await User.create([
    { name: 'Admin Restoran', email: 'admin@resto.com', password: 'admin123', role: 'admin', phone: '081200000000' },
    { name: 'Aldin Pelanggan', email: 'aldin@mail.com', password: 'aldin123', role: 'customer', phone: '081211111111' },
  ]);
  await MenuItem.insertMany(menu);

  console.log('Seed selesai.');
  console.log('   Admin    : admin@resto.com / admin123');
  console.log('   Customer : aldin@mail.com   / aldin123');
  await mongoose.connection.close();
})();
