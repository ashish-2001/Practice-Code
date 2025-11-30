import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    reviews: []
};

const reviewSlice = createSlice({
    name: "review",
    initialState,
    reducers: {
        setReviews(state, action){
            state.reviews = action.payload
        },
        addReviews(state, action){
            state.reviews.push(action.payload)
        }
    }
})

export const { setReviews, addReview } = reviewSlice.actions;
export default reviewSlice.reducer;