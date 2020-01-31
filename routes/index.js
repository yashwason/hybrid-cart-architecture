const express = require(`express`),
    router = express.Router(),
    Product = require(`../models/product`);

router.get(`/`, (req, res) => {
    Product.find({})
    .then((products) => {
        return res.render(`home`, {
            products
        });
    })
    .catch((err) => {
        console.error(err);
        return res.send(`Error retrieving products`);
    });
});

router.post(`/checkout`, (req, res) => {
    // do backend checkout stuff (order saving etc)
    res.json(req.body.cart)
});


module.exports = router;