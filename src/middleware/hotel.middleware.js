// Extracts hotelId from X-Hotel-Id header and attaches to req
// This runs before auth so it only parses the header.
// Access verification happens in route-level middleware if needed.
const scopeByHotel = (req, res, next) => {
  const hotelId = req.headers['x-hotel-id'];
  if (hotelId) {
    req.hotelId = parseInt(hotelId, 10);
  }
  next();
};

// Adds hotelId filter to query where clause
const addHotelFilter = (where, req) => {
  if (req.hotelId) {
    where.hotelId = req.hotelId;
  }
  return where;
};

// Adds hotelId to data being created
const addHotelId = (data, req) => {
  if (req.hotelId) {
    data.hotelId = req.hotelId;
  }
  return data;
};

module.exports = { scopeByHotel, addHotelFilter, addHotelId };
