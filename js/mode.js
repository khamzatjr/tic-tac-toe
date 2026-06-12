let currentMode = 'pvp';
let currentDifficulty = 'easy';

function setMode(mode) {
  currentMode = mode;

  document.getElementById('btn-pvp').classList.toggle('active', mode === 'pvp');
  document.getElementById('btn-ai').classList.toggle('active', mode === 'ai');

  const diffBlock = document.getElementById('difficulty-block');
  const player2Field = document.getElementById('player2-field');
  const aiField = document.getElementById('ai-field');
  const vsDivider = document.getElementById('vs-divider');

  if (mode === 'ai') {
    diffBlock.classList.add('visible');
    player2Field.style.display = 'none';
    aiField.classList.add('visible');
  } else {
    diffBlock.classList.remove('visible');
    player2Field.style.display = 'block';
    aiField.classList.remove('visible');
  }
}

function setDifficulty(diff) {
  currentDifficulty = diff;
  document.getElementById('diff-easy').classList.toggle('active', diff === 'easy');
  document.getElementById('diff-hard').classList.toggle('active', diff === 'hard');
}

function startGame() {
  const p1 = document.getElementById('player1').value.trim();
  const p2 = document.getElementById('player2').value.trim();
  const errorMsg = document.getElementById('error-msg');

  if (!p1) {
    errorMsg.textContent = '✕ Введи имя первого игрока!';
    return;
  }

  if (currentMode === 'pvp' && !p2) {
    errorMsg.textContent = '◯ Введи имя второго игрока!';
    return;
  }

  errorMsg.textContent = '';

  const gameSettings = {
    mode: currentMode,
    difficulty: currentDifficulty,
    player1: p1,
    player2: currentMode === 'pvp' ? p2 : 'Компьютер'
  };

  Storage.save('gameSettings', gameSettings);
  window.location.href = 'game.html';
}

// Подгружаем последнее имя если было
window.addEventListener('DOMContentLoaded', () => {
  const last = Storage.load('gameSettings');
  if (last) {
    document.getElementById('player1').value = last.player1 || '';
    if (last.mode === 'pvp') {
      document.getElementById('player2').value = last.player2 || '';
    }
  }
});