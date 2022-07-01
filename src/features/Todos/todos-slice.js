import {createSlice, createAsyncThunk, createEntityAdapter} from '@reduxjs/toolkit';

import {resetToDefault} from '../Reset/reset-action';

const todosAdapter = createEntityAdapter({
  selectId: (todo) => todo.id,
})

export const loadTodos = createAsyncThunk(
  '@@todos/load-all',
  async (_, {
    rejectWithValue, extra: { api }
  }) => {
    try {
      return api.loadTodos();
    } catch(err) {
      return rejectWithValue('Failed to fetch all todos.');
    }
  },
  {
    condition: (_, { getState, extra }) => {
      const { loading } = getState().todos;

      if (loading === 'loading') {
        return false;
      }
    }
  }
);

export const createTodo = createAsyncThunk(
  '@@todos/create-todo',
  async (title, { extra: { api }}) => {
    return api.createTodo(title);
  }
);

export const toggleTodo = createAsyncThunk(
  '@@todos/toggle-todo',
  async (id, {getState, extra: { api }}) => {
    const todo = getState().todos.entities[id];

    return api.toggleTodo(id, { completed: !todo.completed })
  }
);
export const removeTodo = createAsyncThunk(
  '@@todos/remove-todo',
  async (id, { extra: { api }}) => {
    return api.removeTodo(id);
  }
);

const todoSlice = createSlice({
  name: '@@todos',
  initialState: todosAdapter.getInitialState({
    loading: 'idle',
    error: null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(resetToDefault, () => {
        return []
      })
      .addCase(loadTodos.fulfilled, (state, action) => {
        todosAdapter.addMany(state, action.payload);
      })
      .addCase(createTodo.fulfilled, (state, action) => {
        todosAdapter.addOne(state, action.payload);
      })
      .addCase(toggleTodo.fulfilled, (state, action) => {
        const updatedTodo = action.payload;

        todosAdapter.updateOne(state, {
          id: updatedTodo.id,
          changes: {
            completed: updatedTodo.completed
          }
        })
      })
      .addCase(removeTodo.fulfilled, (state, action) => {
        todosAdapter.removeOne(state, action.payload)
      })
      .addCase(loadTodos.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addMatcher((action) => action.type.endsWith('/rejected'), (state, action) => {
        state.loading = 'idle';
        state.error = action.payload || action.error.message;
      })
      .addMatcher((action) => action.type.endsWith('/fulfilled'), (state) => {
        state.loading = 'idle';
      })
  }
});

export const todoReducer = todoSlice.reducer;
export const todosSelectors = todosAdapter.getSelectors(state => state.todos);

export const selectVisibleTodos = (todos = [], filter) => {
  switch (filter) {
    case 'all': {
      return todos;
    }
    case 'active': {
      return todos.filter(todo => !todo.completed);
    }
    case 'completed': {
      return todos.filter(todo => todo.completed);
    }
    default: {
      return todos;
    }
  }
}