import Cart from '../models/cart';

document.body.onload = function(){
    if(window.localStorage){
        // checking if a Cart already is present in LocalStorage, and creating one if not
        if(!localStorage.getItem(`cart`)){
            localStorage.setItem(`cart`, JSON.stringify(new Cart({})));
        }
        else{
            const productCards = document.querySelectorAll(`.product`),
                cart = new Cart(JSON.parse(localStorage.getItem(`cart`)) ? JSON.parse(localStorage.getItem(`cart`)) : {});
            productCards.forEach((elem) => {
                if(cart.items[elem.dataset.id]){
                    elem.querySelector(`.product-qty span`).textContent = cart.items[elem.dataset.id].qty;
                    renderRemoveProductBtn(elem);
                }
            });

            // checking if items in cart are still valid (in stock/valid/still exists)
            const productIDs = Array.from(productCards).map((product) => product.dataset.id),
                cartItems = cart.generateItemsArray();
            cartItems.forEach((item) => {
                if(!productIDs.includes(item.item.id)){
                    console.log(`doesn't include - ${JSON.stringify(item.item.id)}`);
                    cart.removeItem(item.item.id);
                    localStorage.setItem(`cart`, JSON.stringify(cart));
                }
            });
        }
    }

    const addToCartBtns = document.querySelectorAll(`.add-to-cart`),
        increaseQtyBtns = document.querySelectorAll(`.increase-qty`),
        decreaseQtyBtns = document.querySelectorAll(`.decrease-qty`),
        checkoutBtn = document.querySelector(`.checkout-btn-wrapper .checkout-btn`);
    let removeFromCartBtns = document.querySelectorAll(`.remove-from-cart`);

    // checkout btn
    checkoutBtn.addEventListener(`click`, (e) => checkout());


    // Setting up events on existing 'remove-from-cart' btns
    wireUpRemovalBtns(removeFromCartBtns);

    // Add/Increase Item in Cart logic
    [...addToCartBtns, ...increaseQtyBtns].forEach((btn) => {
        btn.addEventListener(`click`, (e) => {
            // manipulating cart
            const cart = new Cart(JSON.parse(localStorage.getItem(`cart`)) ? JSON.parse(localStorage.getItem(`cart`)) : {});
            cart.increaseByOne(btn.dataset.id, {
                title: btn.dataset.title,
                price: btn.dataset.price,
                color: btn.dataset.color,
                description: btn.dataset.description,
                id: btn.dataset.id
            });
            localStorage.setItem(`cart`, JSON.stringify(cart));


            // rendering changes made in cart to DOM
            document.querySelector(`.product-qty.for-${btn.dataset.id} span`).textContent = cart.items[btn.dataset.id].qty;


            // rendering a 'remove item' btn if doesn't exist already + attaching an event listener to the all such btns (including new one)
            if(document.querySelector(`.action-btns.for-${btn.dataset.id}`).childElementCount < 2){
                renderRemoveProductBtn(btn);

                removeFromCartBtns = document.querySelectorAll(`.remove-from-cart`);
                wireUpRemovalBtns(removeFromCartBtns);
            }
        });
    });

    // Decrease Item in Cart logic
    decreaseQtyBtns.forEach((btn) => {
        btn.addEventListener(`click`, (e) => {
            // manipulating cart
            const cart = new Cart(JSON.parse(localStorage.getItem(`cart`)) ? JSON.parse(localStorage.getItem(`cart`)) : {});
            if(cart.items[btn.dataset.id]){
                cart.reduceByOne(btn.dataset.id);
                localStorage.setItem(`cart`, JSON.stringify(cart));
            }


            // rendering changes made in cart to DOM
            document.querySelector(`.product-qty.for-${btn.dataset.id} span`).textContent = cart.items[btn.dataset.id].qty;
        });
    });

    // Remove Item from Cart logic
    function wireUpRemovalBtns(btnsArray){
        btnsArray.forEach((btn) => {
            btn.addEventListener(`click`, (e) => {
                // manipulating cart
                const cart = new Cart(JSON.parse(localStorage.getItem(`cart`)) ? JSON.parse(localStorage.getItem(`cart`)) : {});
                if(cart.items[btn.dataset.id]){
                    cart.removeItem(btn.dataset.id);
                    btn.remove();
                    localStorage.setItem(`cart`, JSON.stringify(cart));
                }

                // rendering changes made in cart to DOM
                document.querySelector(`.product-qty.for-${btn.dataset.id} span`).textContent = `0`;
            });
        });
    }

    function renderRemoveProductBtn(elem){
        document.querySelector(`.action-btns.for-${elem.dataset.id}`)
                .insertAdjacentHTML(`beforeend`, `<span class="remove-from-cart" data-id="${elem.dataset.id}">Remove From Cart</span>`);
    }

    function checkout(){
        if(!localStorage.getItem(`cart`) || new Cart(JSON.parse(localStorage.getItem(`cart`))).generateItemsArray().length < 1){
            return alert(`No Products in Cart`);
        }
    
        fetch(`/checkout`, {
            method: `POST`,
            redirect: `follow`,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                cart: localStorage.getItem(`cart`) // already stored as JSON
            })
        })
        .then((res) => res.json())
        .then((cart) => {
            if(document.querySelector(`.backend-cart-info`)){
                document.querySelector(`.backend-cart-info`).remove();
            }

            const receivedCart = JSON.parse(cart);
            document.body.insertAdjacentHTML(`afterbegin`, `
                <div class="backend-cart-info">
                    <h2>This data came from the backend</h2>
                    <small>No. of items ordered: ${receivedCart.totalQty}</small>
                    <small>Total price: ${receivedCart.totalPrice}</small>
                </div>
            `);
            localStorage.removeItem(`cart`); // resetting cart

            // re-initiating cart and resetting page
            localStorage.setItem(`cart`, JSON.stringify(new Cart({})));
            const newCart = JSON.parse(localStorage.getItem(`cart`));
            document.querySelectorAll(`.product-qty span`).forEach((elem) => elem.textContent = `0`);
            if(document.querySelectorAll(`.remove-from-cart`)){
                document.querySelectorAll(`.remove-from-cart`).forEach((elem) => elem.remove());
            }
            
        })
        .catch((err) => {
            alert(`Error occured while checking out`);
            console.log(err);
        });
    }
}