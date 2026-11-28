export function resolveDark(theme) {
    if (theme.value == "dark") return true;
    if (theme.value == "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(theme) {
    let dark = resolveDark(theme);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function toggleTheme(theme) {
    theme.value = theme.value != "dark" ? "dark" : "light"; 
    localStorage.setItem("theme", theme.value);
    applyTheme(theme);
}
