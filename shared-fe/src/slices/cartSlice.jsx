import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

const initialState = {
    cart: localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [],

    totalItems: localStorage.getItem("totalItems")
    ? JSON.parse(localStorage.getItem("totalItems"))
    : 0,

    totalAmount: localStorage.getItem("totalAmount")
    ? JSON.parse(localStorage.getItem("totalAmount"))
    : 0
};

const updateCartTotals = (state) => {
    state.totalItems = state.cart.reduce((acc, item) => acc + item.quantity, 0);
    state.totalAmount = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    localStorage.getItem("cart", JSON.stringify(state.cart));
    localStorage.getItem("totalItems", JSON.stringify(state.totalItems));
    localStorage.getItem("totalAmount", JSON.stringify(state.totalAmount));
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const index = state.cart.findIndex((item) => item._id === product._id);

            if(index >= 0){
                state.cart[index].quantity += 1;
                toast.success("Product added to the cart!");
            } else {
                state.cart.push({
                    ...product,
                    quantity: 1
                });
                toast.success("Product added to the cart successfully!");
            }
            updateCartTotals(state);
        },

        removeFromCart: (state, action) => {
            const productId = action.payload;
            state.cart = state.cart.filter((item) => item._id !== productId);

            toast.success("Product removed from the cart");
            updateCartTotals(state);
        },

        increaseQuantity: (state, action) => {
            productId = action.payload;
            const index = state.cart.findIndex((item) => item._id === productId);

            if(index >= 0){
                state.cart[index].quantity += 1;
                updateCartTotals(state);
            }
        },

        decreaseQuantity: (state, action) => {
            productId = action.payload;
            const index = state.cart.findIndex((item) => item._id === productId);

            if(index >= 0){
                if(state.cart[index].quantity > 1){
                    state.cart[index].quantity -= 1;
                }
                else{
                    state.cart.splice(state, 1);
                }

                updateCartTotals(state);
            }
        },

        resetCart: (state) => {
            state.cart = [];
            state.totalAmount = 0;
            state.totalItems = 0;

            localStorage.removeItem("cart");
            localStorage.removeItem("totalAmount");
            localStorage.removeItem("totalItems");

            toast.success("Cart is empty!");
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