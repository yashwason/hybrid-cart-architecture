function Cart(oldCart){
    this.totalPrice = Number(oldCart.totalPrice) || 0;
    this.totalQty = Number(oldCart.totalQty) || 0;
    this.items = oldCart.items || {};

    this.removeItem = function(id){
        delete this.items[id];

        this.totalQty = 0;
        for(id in this.items){
            this.totalQty += this.items[id].qty;
        }

        this.totalPrice = 0;
        for(id in this.items){
            this.totalPrice += Number(this.items[id].price);
        }
    };

    this.reduceByOne = function(id){
        this.items[id].qty--;
        if(this.items[id].qty < 1){
            this.items[id].qty = 1;
            this.items[id].price = Number(this.items[id].item.price);
        }
        else{
            this.items[id].price -= Number(this.items[id].item.price);
        }
        
        this.totalQty = 0;
        for(id in this.items){
            this.totalQty += Number(this.items[id].qty);
        }

        this.totalPrice = 0;
        for(id in this.items){
            this.totalPrice += Number(this.items[id].price);
        }
    };

    this.increaseByOne = function(id, item){
        let storedItem = this.items[id];
        if(!storedItem){
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        
        storedItem.qty++;
        storedItem.price = Number(storedItem.item.price) * Number(storedItem.qty);

        this.totalPrice += Number(storedItem.item.price);
        this.totalQty++;
        return;
    };

    this.generateItemsArray = function(){
        let arr = [];
        for(let id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    };
}

module.exports = Cart;