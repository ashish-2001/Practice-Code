import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    appliedCoupon: null,
    discount: 0
};

const couponSlice = createSlice({
    name: "coupon",
    initialState,
    reducers: {
        applyCoupon(State, action){
            State.appliedCoupon = action.payload.coupon
            State.discount = action.payload.discount
        },
        removeCoupon(State){
            State.appliedCoupon = null,
            State.discount = 0;
        }
    }
})

export const { applyCoupon, removeCoupon } = couponSlice.actions;
export default couponSlice.reducer;