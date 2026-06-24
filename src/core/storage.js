export function loadState(key, defaults) {
  try {
    return Object.assign({}, defaults, JSON.parse(localStorage.getItem(key) || 'null') || {});
  } catch {
    return { ...defaults };
  }
}

export function saveState(key, state) {
  localStorage.setItem(key, JSON.stringify(state));
}

export function resetState(key) {
  localStorage.removeItem(key);
}
