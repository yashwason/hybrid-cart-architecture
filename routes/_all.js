const express = require(`express`),
    router = express.Router();

// Routes
const indexRoutes = require(`./index`);

router.use(indexRoutes);
router.use((req, res, next) => {
    res.status(400).send(`Bad Request`);
});

module.exports = router;