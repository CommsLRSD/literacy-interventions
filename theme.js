// Loaded before the stylesheet so returning visitors do not see a light flash.
const THEME_PREFERENCE_KEY = 'literacy-interventions-theme';
let themeStorageError = false;

try {
    document.documentElement.dataset.theme = localStorage.getItem(THEME_PREFERENCE_KEY) === 'dark' ? 'dark' : 'light';
} catch (error) {
    console.warn('Unable to read the saved appearance preference.', error);
    document.documentElement.dataset.theme = 'light';
    themeStorageError = true;
}

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('settings-dark-mode');
    const status = document.getElementById('settings-theme-status');
    toggle.checked = document.documentElement.dataset.theme === 'dark';
    if (themeStorageError) status.textContent = t('settings_theme_storage_error');
    toggle.addEventListener('change', () => {
        const theme = toggle.checked ? 'dark' : 'light';
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem(THEME_PREFERENCE_KEY, theme);
            status.textContent = '';
        } catch (error) {
            console.warn('Unable to save the appearance preference.', error);
            status.textContent = t('settings_theme_storage_error');
        }
    });
});
