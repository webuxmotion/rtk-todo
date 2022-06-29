import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

import {resetToDefault} from '../Reset/reset-action';

export const createTodo = createAsyncThunk(
  '@@todos/create-todo',
  async (title) => {
    const res = await fetch('http://localhost:3001/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({title, completed: false})
    });
    
    return res.json();
  }
);


const todoSlice = createSlice({
  name: '@@todos',
  initialState: {
    entities: [],
    loading: 'idle', // 'loading' | false
    error: null
  },
  reducers: {
    addTodo: {
      reducer: (state, action) => {
        state.push(action.payload)
      },
      prepare: (data) => {
        
        return {
          payload: data
        }
      }
    },
    removeTodo: (state, action) => {
      const id = action.payload;
      return state.filter((todo) => todo.id !== id);
    },
    toggleTodo: (state, action) => {
      const id = action.payload;
      const todo = state.find((todo) => todo.id === id);
      todo.completed = !todo.completed;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetToDefault, () => {
        return []
      })
      .addCase(createTodo.pending, (state, action) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = 'Some went wrong!';
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        state.entities.push(action.payload);
        state.loading = false;
      })
  }
});
export const {addTodo, removeTodo, toggleTodo} = todoSlice.actions;

export const todoReducer = todoSlice.reducer;


export const selectVisibleTodos = (state, filter) => {
  switch (filter) {
    case 'all': {
      return state.todos.entities;
    }
    case 'active': {
      return state.todos.entities.filter(todo => !todo.completed);
    }
    case 'completed': {
      return state.todos.entities.filter(todo => todo.completed);
    }
    default: {
      return state.todos;
    }
  }
}