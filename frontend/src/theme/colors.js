// src/theme/colors.js

const colors = {
    primary: '#0D1B2A',
    secondary: '#1B263B',
    accent: '#415A77',
    highlight: '#778DA9',
    background: '#E0E1DD'
};

export default colors;

export const setCssVariables = () => {
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--secondary-color', colors.secondary);
    document.documentElement.style.setProperty('--accent-color', colors.accent);
    document.documentElement.style.setProperty('--highlight-color', colors.highlight);
    document.documentElement.style.setProperty('--background-color', colors.background);
};
