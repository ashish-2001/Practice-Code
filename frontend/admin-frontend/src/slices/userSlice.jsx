import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    profile: null,
    addresses: [],
    orders: []
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setProfile: (state, action) => {
            state.profile = action.payload;
        },
        setAddresses: (state, action) => {
            state.addresses = action.payload;
        },
        setUserOrders: (state, action) => {
            state.orders = action.payload
        }
    }
})

export const { setProfile, setAddresses, setUserOrders } = userSlice.actions;
export default userSlice.reducer;