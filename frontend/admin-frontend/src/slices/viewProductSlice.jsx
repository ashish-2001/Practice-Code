import { createSlice } from "@reduxjs/toolkit";;

const initialState = {
    productEntireData: []
};

const viewProductSlice = createSlice({
    name: "viewProductSlice",
    initialState,
    reducers: {
        setEntireProductData: (state, action) => {
            state.productEntireData = action.payload;
        }
    }
});

export const {
    setEntireProductData
} = viewProductSlice.actions;

export default viewProductSlice.reducer;