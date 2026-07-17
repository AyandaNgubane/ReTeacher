@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

* {
  scrollbar-color: #C89B3C33 transparent;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0E1512;
  color: #EDE6D6;
  font-feature-settings: "liga" 1, "kern" 1;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Focus visibility */
a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid #E0B65C;
  outline-offset: 3px;
  border-radius: 2px;
}

/* Ledger card texture */
.ledger-card {
  background: linear-gradient(180deg, #161F1A 0%, #131B16 100%);
  border: 1px solid rgba(200, 155, 60, 0.18);
  position: relative;
}

.ledger-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 27px,
    rgba(237, 230, 214, 0.025) 28px
  );
}

.stamp {
  font-family: var(--font-mono), monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hairline {
  background: linear-gradient(90deg, transparent, rgba(200,155,60,0.5), transparent);
  height: 1px;
}

.underline-brass {
  background-image: linear-gradient(#E0B65C, #E0B65C);
  background-size: 100% 2px;
  background-repeat: no-repeat;
  background-position: 0 100%;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #0E1512;
}
::-webkit-scrollbar-thumb {
  background: rgba(200, 155, 60, 0.25);
  border-radius: 6px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(200, 155, 60, 0.45);
}

.grain-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 50;
  opacity: 0.035;
  mix-blend-mode: overlay;
}

.compass-spin {
  animation: compass-spin 3.2s var(--ease-out-expo) infinite;
}
@keyframes compass-spin {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(190deg); }
  100% { transform: rotate(360deg); }
}
