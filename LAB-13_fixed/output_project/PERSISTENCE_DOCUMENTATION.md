# FIFO – Dark/Light Mode: Persistence Documentation

## Overview

The FIFO website uses the browser's `localStorage` API to remember the user's chosen theme across page reloads and browser sessions. The logic is encapsulated in `theme.js`, a single, self-contained IIFE (Immediately Invoked Function Expression) that is loaded as the **first script tag** in every page's `<head>`.

---

## localStorage Key-Value Schema

| Key          | Possible Values | Default |
|--------------|-----------------|---------|
| `fifo-theme` | `"dark"`        | ✅ Yes  |
| `fifo-theme` | `"light"`       | —       |

- **Key:** `fifo-theme`  
- **Type:** String  
- **Storage scope:** Origin-scoped (persists across all pages under the same domain)  
- **Lifetime:** Until the user clears browser storage or the script removes it

---

## How It Works — Step by Step

### 1. Page Load (Anti-FOUC)

```js
// theme.js — runs synchronously before any DOM paint
const saved = localStorage.getItem("fifo-theme") || "dark";
document.documentElement.setAttribute("data-theme", saved);
```

Because `theme.js` is the **first `<script>` tag** in `<head>`, it executes before the browser renders a single pixel. The `data-theme` attribute is stamped onto `<html>` immediately, so the CSS variables resolve to the correct palette on the very first paint — **eliminating Flash of Unstyled Content (FOUC)**.

### 2. CSS Variable Palettes

`style.css` defines two palettes using CSS Custom Properties:

```css
/* Light mode (default :root) */
:root {
  --bg: #F0F4F8;
  --text-primary: #0F172A;
  --cyan: #0891B2;
  /* …etc */
}

/* Dark mode */
[data-theme="dark"] {
  --bg: #05091A;
  --text-primary: #F1F5F9;
  --cyan: #06B6D4;
  /* …etc */
}
```

Every colour in every component references a variable, so toggling `data-theme` on `<html>` cascades the full theme change instantly with no JavaScript DOM manipulation beyond the one attribute write.

### 3. User Toggles the Theme

```js
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next    = current === "dark" ? "light" : "dark";

  // Apply to DOM (triggers CSS variable cascade)
  document.documentElement.setAttribute("data-theme", next);

  // Persist for next page load / session
  localStorage.setItem("fifo-theme", next);

  // Update toggle button UI (icon + track + ARIA)
  syncToggleUI(next);
}
```

The toggle button is wired in `DOMContentLoaded` so it is always available after the DOM is ready.

### 4. Smooth Transition

CSS transitions are applied globally to prevent jarring colour snaps:

```css
*, *::before, *::after {
  transition:
    background-color 0.30s ease,
    border-color     0.30s ease,
    color            0.30s ease,
    box-shadow       0.30s ease;
}
```

---

## Accessibility

The toggle button includes full ARIA support:

```html
<button
  id="theme-toggle"
  aria-label="Switch to Light Mode"
  aria-pressed="false"
  …
>
```

- `aria-label` — updated dynamically to reflect the action that will be performed  
- `aria-pressed` — set to `"true"` when Light mode is active (button is "pressed in")  
- `focus-visible` outline — visible keyboard-focus ring for keyboard/assistive-tech users

---

## Files Modified

| File            | Change |
|-----------------|--------|
| `theme.js`      | ✨ **New** — complete theme engine (IIFE) |
| `style.css`     | ♻️ **Refactored** — all colours now use CSS variables; added `:root` (light) and `[data-theme="dark"]` palettes; added `.theme-toggle-btn` component styles |
| `index.html`    | ✅ Injected `theme.js`, toggle button, inline CSS overrides |
| `contact.html`  | ✅ Same |
| `schedule.html` | ✅ Same |
| `players.html`  | ✅ Same |
| `tournaments.html` | ✅ Same |
| `login.html`    | ✅ Same |
| `signup.html`   | ✅ Same |

---

## Verification in DevTools

1. Open any page in Chrome/Firefox  
2. Open **DevTools → Application → Local Storage → `file://` (or your origin)**  
3. You will see: `fifo-theme` → `"dark"` (default)  
4. Click the **LIGHT** toggle in the navbar  
5. The value updates to `"light"` in real time  
6. Reload the page — the light theme persists without any flash
