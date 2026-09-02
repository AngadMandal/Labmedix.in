import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ThemeConfig, ThemeMode } from '../types';

export interface ThemeContextType {
  theme: ThemeConfig;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  timeBasedTheme: 'light' | 'dark';
  isDark: boolean;
  isDaytime: boolean;
  currentTimeString: string;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  updateAutoSchedule: (dayStartHour: number, nightStartHour: number) => void;
  setPrimaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
}

const THEME_MODE_KEY = 'labmedix_theme_mode';
const THEME_CONFIG_KEY = 'labmedix_theme_v1';

const DEFAULT_SCHEDULE = {
  enabled: true,
  dayStartHour: 7,   // 7:00 AM
  nightStartHour: 19  // 7:00 PM (19:00)
};

const DEFAULT_THEME: ThemeConfig = {
  mode: 'system',
  primaryColor: '#0B4F9C',
  accentColor: '#109B48',
  autoSchedule: DEFAULT_SCHEDULE
};

/**
 * Calculate if current local time falls in daytime or nighttime hours
 */
const getIsDaytimeNow = (dayStart: number = 7, nightStart: number = 19, date: Date = new Date()): boolean => {
  const currentHour = date.getHours();
  if (dayStart < nightStart) {
    return currentHour >= dayStart && currentHour < nightStart;
  }
  return currentHour >= dayStart || currentHour < nightStart;
};

/**
 * Detect current OS/browser color scheme preference
 */
const getSystemPreference = (): 'light' | 'dark' => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * Load initial theme configuration from local storage or system default
 */
const getInitialTheme = (): ThemeConfig => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const savedConfig = localStorage.getItem(THEME_CONFIG_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed && (parsed.mode === 'light' || parsed.mode === 'dark' || parsed.mode === 'system' || parsed.mode === 'auto_schedule')) {
        return {
          mode: parsed.mode,
          primaryColor: parsed.primaryColor || DEFAULT_THEME.primaryColor,
          accentColor: parsed.accentColor || DEFAULT_THEME.accentColor,
          autoSchedule: parsed.autoSchedule || DEFAULT_SCHEDULE
        };
      }
    }

    const savedMode = localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null;
    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system' || savedMode === 'auto_schedule') {
      return {
        ...DEFAULT_THEME,
        mode: savedMode
      };
    }
  } catch (error) {
    console.warn('[ThemeContext] Failed to parse saved theme settings:', error);
  }

  return DEFAULT_THEME;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemPreference);
  const [nowDate, setNowDate] = useState<Date>(new Date());

  // Interval timer to keep local time updated for auto-schedule evaluation
  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 15000); // Check every 15 seconds for smooth time transitions
    return () => clearInterval(timer);
  }, []);

  const dayStartHour = theme.autoSchedule?.dayStartHour ?? DEFAULT_SCHEDULE.dayStartHour;
  const nightStartHour = theme.autoSchedule?.nightStartHour ?? DEFAULT_SCHEDULE.nightStartHour;

  const isDaytime = useMemo(() => {
    return getIsDaytimeNow(dayStartHour, nightStartHour, nowDate);
  }, [dayStartHour, nightStartHour, nowDate]);

  const timeBasedTheme: 'light' | 'dark' = isDaytime ? 'light' : 'dark';

  const currentTimeString = useMemo(() => {
    return nowDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [nowDate]);

  // Compute resolved theme mode ('light' or 'dark')
  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (theme.mode === 'auto_schedule') {
      return timeBasedTheme;
    }
    if (theme.mode === 'system') {
      return systemTheme;
    }
    return theme.mode;
  }, [theme.mode, timeBasedTheme, systemTheme]);

  const isDark = resolvedTheme === 'dark';
  const isFirstRender = useRef(true);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply theme classes and attributes to DOM
  const applyThemeToDOM = useCallback((dark: boolean) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Sync HTML meta theme-color tag for mobile browsers & status bars
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', dark ? '#070d1e' : '#ffffff');
  }, []);

  // Apply theme with smooth cross-fade animation
  const applyThemeWithTransition = useCallback((dark: boolean) => {
    if (typeof document === 'undefined') return;

    // On initial mount, apply immediately without transition animation
    if (isFirstRender.current) {
      isFirstRender.current = false;
      applyThemeToDOM(dark);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      applyThemeToDOM(dark);
      return;
    }

    // Use native View Transitions API if supported (Chrome/Edge/Safari 18+)
    if ('startViewTransition' in document && typeof (document as any).startViewTransition === 'function') {
      try {
        (document as any).startViewTransition(() => {
          applyThemeToDOM(dark);
        });
        return;
      } catch {
        // Fallback below if View Transition throws
      }
    }

    // Fallback: Apply smooth CSS cross-fade transition class to DOM
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    applyThemeToDOM(dark);

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    transitionTimeoutRef.current = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 400);
  }, [applyThemeToDOM]);

  // Clean up any pending transition timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Listen to live system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
    };

    handleSystemThemeChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  // Apply resolved theme to DOM with smooth cross-fade animation and persist to localStorage
  useEffect(() => {
    applyThemeWithTransition(isDark);

    try {
      localStorage.setItem(THEME_MODE_KEY, theme.mode);
      localStorage.setItem(THEME_CONFIG_KEY, JSON.stringify(theme));
    } catch (error) {
      console.warn('[ThemeContext] Could not persist theme preference:', error);
    }
  }, [theme, isDark, applyThemeWithTransition]);

  // Synchronize across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_MODE_KEY && e.newValue) {
        const mode = e.newValue as ThemeMode;
        if (mode === 'light' || mode === 'dark' || mode === 'system' || mode === 'auto_schedule') {
          setTheme(prev => ({ ...prev, mode }));
        }
      } else if (e.key === THEME_CONFIG_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && (parsed.mode === 'light' || parsed.mode === 'dark' || parsed.mode === 'system' || parsed.mode === 'auto_schedule')) {
            setTheme(parsed);
          }
        } catch {
          // Ignore parse errors from concurrent tab writes
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setTheme(prev => ({ ...prev, mode }));
  }, []);

  const updateAutoSchedule = useCallback((dStart: number, nStart: number) => {
    setTheme(prev => ({
      ...prev,
      autoSchedule: {
        enabled: true,
        dayStartHour: Math.max(0, Math.min(23, dStart)),
        nightStartHour: Math.max(0, Math.min(23, nStart))
      }
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    // Cycle modes: system -> auto_schedule -> light -> dark -> system
    setTheme(prev => {
      let nextMode: ThemeMode = 'light';
      if (prev.mode === 'light') nextMode = 'dark';
      else if (prev.mode === 'dark') nextMode = 'system';
      else if (prev.mode === 'system') nextMode = 'auto_schedule';
      else if (prev.mode === 'auto_schedule') nextMode = 'light';
      return { ...prev, mode: nextMode };
    });
  }, []);

  const setPrimaryColor = useCallback((primaryColor: string) => {
    setTheme(prev => ({ ...prev, primaryColor }));
  }, []);

  const setAccentColor = useCallback((accentColor: string) => {
    setTheme(prev => ({ ...prev, accentColor }));
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,
      timeBasedTheme,
      isDark,
      isDaytime,
      currentTimeString,
      setThemeMode,
      toggleTheme,
      updateAutoSchedule,
      setPrimaryColor,
      setAccentColor
    }),
    [
      theme,
      resolvedTheme,
      systemTheme,
      timeBasedTheme,
      isDark,
      isDaytime,
      currentTimeString,
      setThemeMode,
      toggleTheme,
      updateAutoSchedule,
      setPrimaryColor,
      setAccentColor
    ]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

