import Cart from '../models/cart';

document.body.onload = function(){
    const addToCartBtns = document.querySelectorAll(`.add-to-cart`),
        increaseQtyBtns = document.querySelectorAll(`.increase-qty`),
        decreaseQtyBtns = document.querySelectorAll(`.decrease-qty`),
        checkoutBtn = document.querySelector(`.checkout-btn-wrapper .checkout-btn`),
        reqOptions = {
            method: `POST`,
            redirect: `follow`,
            headers: {'Content-Type': 'application/json'}
        };
    let removeFromCartBtns = document.querySelectorAll(`.remove-from-cart`);

    // Checking if browser supports LocalStorage and using that to store Cart
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
                    renderRemoveProductBtn(elem.dataset.id);
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

        // checkout btn
        checkoutBtn.addEventListener(`click`, (e) => localStorageCheckout());


        // Setting up events on existing 'remove-from-cart' btns
        wireUpLSCartRemovalBtns(removeFromCartBtns);


        // Add/Increase Item in LS Cart logic
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
                    renderRemoveProductBtn(btn.dataset.id);

                    removeFromCartBtns = document.querySelectorAll(`.remove-from-cart`);
                    wireUpLSCartRemovalBtns(removeFromCartBtns);
                }
            });
        });

        // Decrease Item in LS Cart logic
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

        // Remove Item from LS Cart logic
        function wireUpLSCartRemovalBtns(btnsArray){
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

    
        function localStorageCheckout(){
            if(!localStorage.getItem(`cart`) || new Cart(JSON.parse(localStorage.getItem(`cart`))).generateItemsArray().length < 1){
                return alert(`No Products in Cart`);
            }
        
            fetch(`/checkout/localstorage`, {
                ...reqOptions,
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
                renderReceivedCartInfo(receivedCart);
                localStorage.removeItem(`cart`); // resetting cart

                // re-initiating cart and resetting page
                localStorage.setItem(`cart`, JSON.stringify(new Cart({})));
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
    // Storing Cart in session if browser doesn't support LocalStorage
    else{
        // checkout btn
        checkoutBtn.addEventListener(`click`, (e) => sessionCartCheckout());

        // Remove Item from Session Cart Logic
        wireUpSessionCartRemovalBtns(document.querySelectorAll(`.remove-from-cart`));
        
        // Add/Increase Item in Session Cart logic
        [...addToCartBtns, ...increaseQtyBtns].forEach((btn) => {
            btn.addEventListener(`click`, (e) => {
                changeItemQtyInSession(`inc`, btn.dataset.id);
            });
        });

        // Decrease Item in Session Cart logic
        decreaseQtyBtns.forEach((btn) => {
            btn.addEventListener(`click`, (e) => {
                changeItemQtyInSession(`dec`, btn.dataset.id);
            });
        });


        function changeItemQtyInSession(incOrDecOperation, productId){
            let incBtn = document.querySelector(`.increase-qty.for-${productId}`),
                decBtn = document.querySelector(`.decrease-qty.for-${productId}`);
        
            incBtn.setAttribute(`disabled`, true);
            decBtn.setAttribute(`disabled`, true);

            let operationToDo = incOrDecOperation === `inc` ? `increase` : `decrease`;

            fetch(`/${operationToDo}-by-one/${productId}`, reqOptions)
            .then((res) => {
                return res.json();
            })
            .then((jsonRes) => {
                document.querySelector(`.product-qty.for-${productId} span`).textContent = jsonRes.items[productId].qty;
        
                incBtn.removeAttribute(`disabled`);
                decBtn.removeAttribute(`disabled`);
        
                if(document.querySelector(`.action-btns.for-${productId}`).childElementCount < 2){
                    renderRemoveProductBtn(productId);

                    wireUpSessionCartRemovalBtns(document.querySelectorAll(`.remove-from-cart`));
                }
            })
            .catch((err) => {
                console.log(`Error changing item. ${err}`);
            });
        }

        function wireUpSessionCartRemovalBtns(nodeList){
            nodeList.forEach((btn) => {
                btn.addEventListener(`click`, (e) => {
                    btn.setAttribute(`disabled`, true);
        
                    const originalBtnText = btn.textContent;
                    btn.textContent = `Processing...`;
                    
                    let productId = btn.dataset.id;
                
                    fetch(`/remove-from-cart/${productId}`, reqOptions)
                    .then((res) => {
                        return res.json();
                    })
                    .then((jsonRes) => {
                        btn.textContent = originalBtnText;
                        document.querySelector(`.product-qty.for-${productId} span`).textContent = `0`;
                        btn.remove();
                    })
                    .catch((err) => {
                        console.log(`error. ${err}`);
                    });
                });
            });
        }

        function sessionCartCheckout(){
            fetch(`/checkout/session`, reqOptions)
            .then((res) => res.json())
            .then((receivedInfo) => {
                if(receivedInfo.error && receivedInfo.error.status){
                    return alert(receivedInfo.error.message);
                }

                const receivedCart =  receivedInfo;
                if(document.querySelector(`.backend-cart-info`)){
                    document.querySelector(`.backend-cart-info`).remove();
                }

                renderReceivedCartInfo(receivedCart);

                // resetting page
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
}

function renderRemoveProductBtn(id){
    document.querySelector(`.action-btns.for-${id}`)
            .insertAdjacentHTML(`beforeend`, `<span class="remove-from-cart for-${id}" data-id="${id}">Remove From Cart</span>`);
}

function renderReceivedCartInfo(receivedCart){
    document.body.insertAdjacentHTML(`afterbegin`, `
        <div class="backend-cart-info">
            <h2>This data came from the backend</h2>
            <small>No. of items ordered: ${receivedCart.totalQty}</small>
            <small>Total price: ${receivedCart.totalPrice}</small>
        </div>
    `);
}