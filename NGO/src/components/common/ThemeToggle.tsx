import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useNGO } from '../../context/NGOContext';

export const ThemeToggle: React.FC = () => {
  const { state, dispatch } = useNGO();
  const isDark = state.theme === 'dark';

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: isDark ? 'light' : 'dark' });
  };

  return (
    <button
      type="button"
      className="btn btn-ghost theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        padding: '0.5rem',
        borderRadius: 'var(--radius-full)',
        color: 'var(--color-text-main)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isDark ? (
        <Sun size={19} className="theme-icon" style={{ color: 'var(--color-accent-400)' }} />
      ) : (
        <Moon size={19} className="theme-icon" style={{ color: 'var(--color-teal-600)' }} />
      )}
    </button>
  );
};
