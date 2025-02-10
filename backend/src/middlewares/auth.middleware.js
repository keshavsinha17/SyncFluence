import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utilities/AsyncHandler.js';
import {User} from '../model/user.model.js';
import { ApiError } from '../utilities/ApiError.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      throw new ApiError(401, 'Not authorized, token failed', error); 
    }
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token');
  }
});

const isBrand = (req, res, next) => {
  if (req.user && req.user.userType === 'brand') {
    next();
  } else {
    throw new ApiError(403, 'Not authorized as a brand');
  }
};

const isInfluencer = (req, res, next) => {
  if (req.user && req.user.userType === 'influencer') {
    next();
  } else {
    res.status(403);
    throw new ApiError(403, 'Not authorized as an influencer');
  }
};

module.exports = { protect, isBrand, isInfluencer };