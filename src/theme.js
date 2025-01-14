/**
 * Theme management system for HEXTRA-3
 * Consistent with VOID-Box theme implementation
 */

const THEME_STORAGE_KEY = 'hextra-theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

class ThemeManager {
    constructor() {
        this.transitions = {
            duration: '0.3s',
            properties: ['background-color', 'color', 'border-color', 'filter']
        };
    }

    init() {
        // Set up system preference listener
        this.setupSystemPreferenceListener();
        
        // Get initial theme
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (systemPrefersDark ? THEMES.DARK : THEMES.LIGHT);
        
        // Apply initial theme
        this.applyTheme(initialTheme);
    }

    setupSystemPreferenceListener() {
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => {
                if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                    this.applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
                }
            });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        this.applyTheme(newTheme);
        return newTheme;
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme');
    }
}

export default new ThemeManager();
