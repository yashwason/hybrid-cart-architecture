const express = require(`express`),
    router = express.Router(),
    Product = require(`../models/product`),
    Cart = require(`../models/cart`);


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

router.post(`/checkout/:cartStorageArea`, (req, res) => {
    if(req.params.cartStorageArea.toLowerCase() === `localstorage`){
        // do backend checkout stuff (order saving etc)
        return res.json(req.body.cart);
    }
    else if(req.params.cartStorageArea.toLowerCase() === `session`){
        // do backend checkout stuff (order saving etc)
        const cart = new Cart(req.session.cart ? req.session.cart : {});

        if(!cart.generateItemsArray().length){
            return res.json({
                error: {
                    status: true,
                    message: `No Products in Cart`
                }
            });
        }
        else{
            // resetting cart
            req.session.cart = null;
            return res.json(cart);
        }
    }
});


// cart manipulation routes
router.post(`/increase-by-one/:id`, (req, res) => {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId)
    .then((product) => {
        cart.increaseByOne(productId, {
            title: product.title,
            price: product.price,
            color: product.color,
            description: product.description,
            id: product._id
        });
        req.session.cart = cart;
        return res.send(cart);
    })
    .catch((err) => {
        console.log(`Error locating product to add to cart. ${err}`);
    });
});

router.post(`/decrease-by-one/:id`, (req, res) => {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    return res.send(cart);
});

router.post(`/remove-from-cart/:id`, (req, res) => {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    return res.send(cart);
});


module.exports = router;