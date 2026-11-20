const AppError = require('../utils/AppError');

exports.notFound = (req, res, next) =>
  next(new AppError(`Rute ${req.method} ${req.originalUrl} tidak ditemukan`, 404));

exports.errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan pada server';

  if (err.name === 'CastError') {
    status = 400;
    message = `ID tidak valid: ${err.value}`;
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue)[0]} sudah digunakan`;
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Token tidak valid';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token sudah kedaluwarsa, silakan login ulang';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Body JSON tidak valid';
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan pada server' : message,
    ...(process.env.NODE_ENV === 'development' && status >= 500 && { stack: err.stack }),
  });
};
