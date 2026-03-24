(function () {
    const STORAGE_KEY = 'theme-preference';

    function getPreferredTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }

        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemPrefersDark ? 'dark' : 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        updateToggleLabels(theme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    }

    function updateToggleLabels(theme) {
        const buttons = document.querySelectorAll('[data-theme-toggle]');
        buttons.forEach((button) => {
            button.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
            button.setAttribute('aria-label', 'Toggle color theme');
        });
    }

    function wireButtons() {
        const buttons = document.querySelectorAll('[data-theme-toggle]');
        buttons.forEach((button) => {
            if (!button.dataset.boundThemeToggle) {
                button.addEventListener('click', toggleTheme);
                button.dataset.boundThemeToggle = 'true';
            }
        });
    }

    function ensureFloatingToggle() {
        if (document.querySelector('[data-theme-toggle]')) {
            return;
        }

        const floatingButton = document.createElement('button');
        floatingButton.type = 'button';
        floatingButton.className = 'btn theme-toggle-btn floating-theme-toggle';
        floatingButton.setAttribute('data-theme-toggle', 'true');
        document.body.appendChild(floatingButton);
    }

    function initTheme() {
        setTheme(getPreferredTheme());
        ensureFloatingToggle();
        wireButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
