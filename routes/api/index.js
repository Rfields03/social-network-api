const router = require('express').Router();
const { rateLimit } = require('express-rate-limit');
const thoughtRoutes = require('./thought-routes');
const userRoutes = require('./user-routes');

router.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

router.use('/thoughts', thoughtRoutes);
// add prefix of `/users` to routes created in `user-routes.js`
router.use('/users', userRoutes);

module.exports = router;