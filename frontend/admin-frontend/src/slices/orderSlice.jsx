import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orders: [],
    orderDetails: null
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setOrders(State, action){
            State.orders = action.payload
        },
        setOrderDetails(state, action){
            state.orderDetails = action.payload
        }
    }
});

export const { setOrders, setOrderDetails } = orderSlice.actions;
export default orderSlice.reducer;