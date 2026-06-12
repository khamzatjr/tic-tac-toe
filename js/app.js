const Storage = {
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  load(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('theme-btn');

  body.classList.toggle('dark');

  const isDark = body.classList.contains('dark');
  btn.textContent = isDark ? '☀️' : '🌙';
  Storage.save('theme', isDark ? 'dark' : 'light');
}

function applyTheme() {
  const saved = Storage.load('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = '☀️';
  }
}

document.addEventListener('DOMContentLoaded', applyTheme);