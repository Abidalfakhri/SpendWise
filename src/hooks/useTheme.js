import { useTheme } from '../contexts/ThemeContext';
export default function useThemeHook() {
  const { theme, toggle } = useTheme();
  return { theme, toggle };
}