import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    inventory: [],
    loading: false,
    error: null
}

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        setInventory(State, action){
            State.inventory = action.payload
        },
        addInventoryItem(state, action){
            state.inventory.push(action.payload);
        },
        updateInventoryItem(state, action){
            const item = action.payload;
            const index = state.inventory.findIndex(i => i._id === item._id);
            if(index !== -1){
                state.inventory[index] = item;
            }
        },
        deleteInventoryItem(state, action){
            state.inventory = state.inventory.filter(i => i._id !== action.payload);
        },
        setInventoryLoading(state, action){
            state.loading = action.payload;
        },
        setInventoryError(state, action){
            state.error = action.payload;
        }
    }
});

export const {
    setInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    setInventoryLoading,
    setInventoryError
} = inventorySlice.actions;

export default inventorySlice.reducer;