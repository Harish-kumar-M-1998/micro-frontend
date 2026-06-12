import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode, ThemeState } from '../../types';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode;
}

const storedMode = (typeof localStorage !== 'undefined'
  ? localStorage.getItem('mfe_theme')
  : null) as ThemeMode | null;

const initialMode: ThemeMode = storedMode ?? 'system';

const initialState: ThemeState = {
  mode: initialMode,
  resolvedTheme: resolveTheme(initialMode),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      state.resolvedTheme = resolveTheme(action.payload);
      localStorage.setItem('mfe_theme', action.payload);
      document.documentElement.classList.toggle('dark', state.resolvedTheme === 'dark');
    },
    toggleTheme(state) {
      const next = state.resolvedTheme === 'light' ? 'dark' : 'light';
      state.mode = next;
      state.resolvedTheme = next;
      localStorage.setItem('mfe_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
    },
  },
});

export const { setThemeMode, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
