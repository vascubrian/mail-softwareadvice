module.exports = (error, _req, res, _next) => {
  console.error(error);
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ success: false, message: 'File must be 10 MB or smaller' });
  if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ success: false, message: 'A lead with this email already exists' });
  res.status(error.status || 500).json({ success: false, message: error.publicMessage || 'An unexpected error occurred' });
};
