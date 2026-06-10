/**
 * FIFO – Theme System
 * Handles dark/light mode with localStorage persistence.
 *
 * localStorage key : "fifo-theme"
 * Possible values  : "dark" | "light"
 *
 * On every page load the script reads the stored preference (or defaults
 * to dark) and immediately stamps data-theme onto <html> BEFORE the
 * browser paints the first frame, eliminating Flash of Unstyled Content.
 */

(function () {
  "use strict";

  /* ── Constants ─────────────────────────────────────── */
  const STORAGE_KEY = "fifo-theme";
  const DARK = "dark";
  const LIGHT = "light";

  /* ── Read stored preference (default: dark) ─────────── */
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DARK;
    } catch {
      return DARK; // Private-browsing / storage disabled
    }
  }

  /* ── Persist the chosen theme ───────────────────────── */
  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore storage errors */
    }
  }

  /* ── Apply theme to <html> ──────────────────────────── */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  /* ── Toggle between dark & light ───────────────────── */
  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") || DARK;
    const next = current === DARK ? LIGHT : DARK;
    applyTheme(next);
    saveTheme(next);
    syncToggleUI(next);
  }

  /* ── Update toggle button visuals ──────────────────── */
  function syncToggleUI(theme) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    const isDark = theme === DARK;

    /* ARIA */
    btn.setAttribute(
      "aria-label",
      isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
    );
    btn.setAttribute("aria-pressed", isDark ? "false" : "true");

    /* Icon swap */
    const iconEl = btn.querySelector(".theme-icon");
    if (iconEl) {
      iconEl.setAttribute("data-lucide", isDark ? "sun" : "moon");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }

    /* Label text */
    const labelEl = btn.querySelector(".theme-label");
    if (labelEl) labelEl.textContent = isDark ? "LIGHT" : "DARK";

    /* Track indicator */
    const track = btn.querySelector(".toggle-track");
    if (track) {
      track.classList.toggle("is-light", !isDark);
    }
  }

  /* ── Bootstrap ──────────────────────────────────────── */

  // 1. Apply theme immediately to prevent FOUC
  const initialTheme = getSavedTheme();
  applyTheme(initialTheme);

  // 2. After DOM is ready, wire up the toggle button
  document.addEventListener("DOMContentLoaded", function () {
    syncToggleUI(initialTheme);

    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", toggleTheme);
    }
  });

  // 3. Expose globally so inline onclick attributes can also call it
  window.FIFO_Theme = { toggle: toggleTheme, apply: applyTheme };
})();
