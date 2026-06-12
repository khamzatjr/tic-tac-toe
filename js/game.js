const AudioManager = {
  ctx: null,

  getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.ctx;
  },

  play(type) {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'move') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      }

      if (type === 'win') {
        [523, 659, 784, 1046].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
          o.start(ctx.currentTime + i * 0.12);
          o.stop(ctx.currentTime + i * 0.12 + 0.3);
        });
      }

      if (type === 'draw') {
        [330, 294, 262].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.25);
          o.start(ctx.currentTime + i * 0.15);
          o.stop(ctx.currentTime + i * 0.15 + 0.25);
        });
      }

    } catch(e) {}
  }
};

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let scores = { X: 0, O: 0 };
let settings = {};

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const LINE_COORDS = {
  '0,1,2': { x1: 50,  y1: 50,  x2: 250, y2: 50  },
  '3,4,5': { x1: 50,  y1: 150, x2: 250, y2: 150 },
  '6,7,8': { x1: 50,  y1: 250, x2: 250, y2: 250 },
  '0,3,6': { x1: 50,  y1: 50,  x2: 50,  y2: 250 },
  '1,4,7': { x1: 150, y1: 50,  x2: 150, y2: 250 },
  '2,5,8': { x1: 250, y1: 50,  x2: 250, y2: 250 },
  '0,4,8': { x1: 50,  y1: 50,  x2: 250, y2: 250 },
  '2,4,6': { x1: 250, y1: 50,  x2: 50,  y2: 250 }
};

function init() {
  settings = Storage.load('gameSettings') || {
    mode: 'pvp',
    difficulty: 'easy',
    player1: 'Игрок 1',
    player2: 'Игрок 2'
  };

  document.getElementById('name-p1').textContent = settings.player1;
  document.getElementById('name-p2').textContent = settings.player2;

  updateTurnIndicator();
  updateActivePlayer();

  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.addEventListener('click', handleClick);
  });
}

function handleClick(e) {
  const index = parseInt(e.target.dataset.index);

  if (!gameActive || board[index] !== '') return;

  makeMove(index, currentPlayer);

  if (!checkEnd()) {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
    updateActivePlayer();

    if (settings.mode === 'ai' && currentPlayer === 'O' && gameActive) {
      setTimeout(aiMove, 500);
    }
  }
}

function makeMove(index, player) {
  board[index] = player;
  const cell = document.querySelector(`[data-index="${index}"]`);
  cell.textContent = player === 'X' ? '✕' : '◯';
  cell.classList.add(player.toLowerCase(), 'taken', 'pop');
  AudioManager.play('move');
}

function checkEnd() {
  const winner = getWinner();

  if (winner) {
    gameActive = false;
    scores[winner]++;
    updateScores();
    drawWinLine(winner.combo);
    setTimeout(() => showResult(winner.player), 500);
    saveRecord(winner.player === 'X' ? settings.player1 : settings.player2);
    return true;
  }

  if (!board.includes('')) {
    gameActive = false;
    setTimeout(() => showDraw(), 400);
    saveRecord(null);
    return true;
  }

  return false;
}

function getWinner() {
  for (const combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], combo };
    }
  }
  return null;
}

function updateTurnIndicator() {
  const name = currentPlayer === 'X' ? settings.player1 : settings.player2;
  document.getElementById('turn-name').textContent = name;
}

function updateActivePlayer() {
  const p1 = document.getElementById('info-p1');
  const p2 = document.getElementById('info-p2');

  if (currentPlayer === 'X') {
    p1.classList.remove('inactive');
    p2.classList.add('inactive');
  } else {
    p1.classList.add('inactive');
    p2.classList.remove('inactive');
  }

  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('hint-x', 'hint-o');
    cell.dataset.hint = currentPlayer === 'X' ? '✕' : '◯';
    cell.classList.add(currentPlayer === 'X' ? 'hint-x' : 'hint-o');
  });
}

function updateScores() {
  document.getElementById('score-p1').textContent = scores.X;
  document.getElementById('score-p2').textContent = scores.O;
}

function drawWinLine(combo) {
  const key = combo.join(',');
  const coords = LINE_COORDS[key];
  if (!coords) return;

  const line = document.getElementById('win-line-el');
  line.setAttribute('x1', coords.x1);
  line.setAttribute('y1', coords.y1);
  line.setAttribute('x2', coords.x2);
  line.setAttribute('y2', coords.y2);

  setTimeout(() => line.classList.add('draw'), 50);
}

function showResult(player) {
  AudioManager.play('win');
  const name = player === 'X' ? settings.player1 : settings.player2;
  document.getElementById('result-emoji').textContent = '🏆';
  document.getElementById('result-text').textContent = 'Победитель:';
  document.getElementById('result-name').textContent = name;
  document.getElementById('result-overlay').classList.add('visible');
}

function showDraw() {
  AudioManager.play('draw');
  document.getElementById('result-emoji').textContent = '🤝';
  document.getElementById('result-text').textContent = 'Ничья!';
  document.getElementById('result-name').textContent = 'Оба молодцы';
  document.getElementById('result-overlay').classList.add('visible');
}

function restartGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;

  document.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });

  const line = document.getElementById('win-line-el');
  line.classList.remove('draw');
  line.setAttribute('x1', 0);
  line.setAttribute('y1', 0);
  line.setAttribute('x2', 0);
  line.setAttribute('y2', 0);

  document.getElementById('result-overlay').classList.remove('visible');

  updateTurnIndicator();
  updateActivePlayer();
}

function saveRecord(winnerName) {
  const records = Storage.load('records') || [];
  records.unshift({
    date: new Date().toLocaleDateString('ru-RU'),
    player1: settings.player1,
    player2: settings.player2,
    winner: winnerName || 'Ничья',
    mode: settings.mode
  });
  if (records.length > 50) records.pop();
  Storage.save('records', records);
}



function aiMove() {
  if (!gameActive) return;

  let index;
  if (settings.difficulty === 'easy') {
    index = aiEasy();
  } else {
    index = aiHard();
  }

  makeMove(index, 'O');

  if (!checkEnd()) {
    currentPlayer = 'X';
    updateTurnIndicator();
    updateActivePlayer();
  }
}

function aiEasy() {
  const empty = board
    .map((val, idx) => val === '' ? idx : null)
    .filter(idx => idx !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function aiHard() {
  let bestScore = -Infinity;
  let bestIndex = 0;

  board.forEach((val, idx) => {
    if (val === '') {
      board[idx] = 'O';
      const score = minimax(board, 0, false);
      board[idx] = '';
      if (score > bestScore) {
        bestScore = score;
        bestIndex = idx;
      }
    }
  });

  return bestIndex;
}

function minimax(boardState, depth, isMaximizing) {
  const winner = getWinnerForMinimax(boardState);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (!boardState.includes('')) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    boardState.forEach((val, idx) => {
      if (val === '') {
        boardState[idx] = 'O';
        best = Math.max(best, minimax(boardState, depth + 1, false));
        boardState[idx] = '';
      }
    });
    return best;
  } else {
    let best = Infinity;
    boardState.forEach((val, idx) => {
      if (val === '') {
        boardState[idx] = 'X';
        best = Math.min(best, minimax(boardState, depth + 1, true));
        boardState[idx] = '';
      }
    });
    return best;
  }
}

function getWinnerForMinimax(boardState) {
  for (const [a, b, c] of WIN_COMBOS) {
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a];
    }
  }
  return null;
}

init();