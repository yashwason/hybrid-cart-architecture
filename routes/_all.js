const express = require(`express`),
    router = express.Router();

// local variables
router.use((req, res, next) => {
    res.locals.cartSession = req.session.cart;
    next();
});

// Routes
const indexRoutes = require(`./index`);

router.use(indexRoutes);
router.use((req, res, next) => {
    res.status(400).send(`Bad Request`);
});

module.exports = router;