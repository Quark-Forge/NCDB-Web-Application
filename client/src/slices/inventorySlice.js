// src/features/inventory/inventorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Base URL
const API_BASE_URL = 'http://localhost:3000/inventory';

// Async thunk to fetch inventory list
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, thunkAPI) => {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  }
);

// Async thunk to receive stock
export const receiveStock = createAsyncThunk(
  'inventory/receiveStock',
  async ({ product_id, quantity, note }, thunkAPI) => {
    const res = await fetch(`${API_BASE_URL}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id, quantity, note }),
    });
    if (!res.ok) throw new Error('Failed to receive stock');
    return res.json();
  }
);

// Add similar asyncThunks for shipStock, adjustStock...

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // You can add synchronous reducers if needed
  },
  extraReducers: (builder) => {
    builder
      // fetchInventory handlers
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // receiveStock handlers
      .addCase(receiveStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receiveStock.fulfilled, (state, action) => {
        state.loading = false;
        // After receiving stock, update the stock in the state
        const updatedStock = action.payload.stock;
        const index = state.items.findIndex(i => i.product_id === updatedStock.product_id);
        if (index >= 0) {
          state.items[index] = updatedStock;
        } else {
          state.items.push(updatedStock);
        }
      })
      .addCase(receiveStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // similarly add shipStock and adjustStock here...
  },
});

export default inventorySlice.reducer;
