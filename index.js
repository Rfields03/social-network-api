const router = require('express').Router();
//import routes from /api/index.js
const apiRoutes = require('./api');

//add api prefic to imported routes
router.use('/api', apiRoutes);

router.use((req, res) => {
    res.status(404).send('<h1>😝 404 Error!</h1>');
});

module.exports = router;