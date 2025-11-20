import { createSlice } from "@reduxjs/toolkit";
import{ toast } from "react-hot-toast";

const initialState = {
    cart: localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [],

    totalItems: localStorage.getItem("totalItems")
    ? JSON.parse(localStorage.getItem("totalItems"))
    : 0,

    totalAmount: localStorage.getItem("totalAmount")
    ? JSON.parse(localStorage.getItem("totalItems"))
    : 0
};

const updateProductTotal = (state) => {
    state.totalItems = state.cart.reduce((acc, item) => acc + item.quantity, 0);
    state.totalAmount = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    localStorage.setItem("cart", JSON.stringify(state.cart));
    localStorage.setItem("totalItems", JSON.stringify(state.totalItems));
    localStorage.setItem("totalAmount", JSON.stringify(state.totalAmount));
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;

            const index = state.cart.findIndex((item) => item._id === product._id);

            if(index >= 0){
                state.cart[index].quantity += 1
                toast.success("Product added to the cart");
            } else{
                state.cart.push({
                    ...product,
                    quantity: 1
                });
            }

            toast.success("Product added to the cart!");
            updateProductTotal(state);
        },

        removeFromCart: (state, action) => {
            const productId = action.payload;
            
            state.cart.filter((item) => item._id !== productId);

            toast.success("Product removed from the cart");
            updateProductTotal(state);
        },

        increaseQuantity: (state, action) => {
            const product = action.payload;
            const index = state.cart.findIndex((item) => item._id === product._id);

            if(index >= 0){
                state.cart[index].quantity += 1;
                toast.success("Quantity increased for the product!");
                updateProductTotal(state);
            }
        },

        decreaseQuantity: (state, action) => {
            const product = action.payload;
            const index = state.cart.findIndex((item) => item._ud === product._id);
            
            if(index >= 0){
                if(state.cart[index].quantity > 1){
                    state.cart[index].quantity -= 1;
                    toast.success("Product removed from the quantity!");
                } else{
                    state.cart.splice(index, 1);
                }

                updateProductTotal(state);
            }
        },

        resetCart: (state) => {
            state.cart = [];
            state.totalItems = 0;
            state.totalAmount = 0;

            localStorage.removeItem("cart");
            localStorage.removeItem("totalItems");
            localStorage.removeItem("totalAmount");
            
            toast.success("Cart cleared!");
        }
    }
});

export const {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    resetCart
} = cartSlice.actions;

export default cartSlice.reducer;