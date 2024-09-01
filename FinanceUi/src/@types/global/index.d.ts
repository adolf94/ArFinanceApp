declare global {
  interface Window { webConfig: any; }
}

window.webConfig = window.webConfig || {};