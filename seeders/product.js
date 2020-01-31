require(`dotenv`).config({path:`../process.env`});
const faker = require(`faker`),
    Product = require(`../models/product`);

// DB Setup
require(`../config/mongoose`);

for(let i=0; i<20; i++){
    Product.create({
        title: faker.commerce.product(),
        price: faker.commerce.price(),
        description: faker.lorem.sentence(),
        color: faker.commerce.color()
    })
    .then((product) => console.log(product))
    .catch((err) => console.error(err));
}