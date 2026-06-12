function loadRecords() {
  const records = Storage.load('records') || [];
  const empty = document.getElementById('records-empty');
  const table = document.getElementById('records-table');
  const tbody = document.getElementById('records-tbody');

  // Статистика
  const total = records.length;
  const draws = records.filter(r => r.winner === 'Ничья').length;
  const winsX = records.filter(r => r.winner === r.player1).length;
  const winsO = records.filter(r => r.winner === r.player2).length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-wins').textContent = winsX;
  document.getElementById('stat-losses').textContent = winsO;
  document.getElementById('stat-draws').textContent = draws;

  if (total === 0) {
    empty.style.display = 'flex';
    table.classList.remove('visible');
    return;
  }

  empty.style.display = 'none';
  table.classList.add('visible');

  tbody.innerHTML = '';

  records.forEach(record => {
    const tr = document.createElement('tr');

    // Класс для победителя
    let winnerClass = 'draw';
    if (record.winner === record.player1) winnerClass = 'win-x';
    else if (record.winner === record.player2) winnerClass = 'win-o';

    const modeText = record.mode === 'ai' ? '🤖 vs ИИ' : '👥 2 игрока';

    tr.innerHTML = `
      <td>${record.date}</td>
      <td>${record.player1}</td>
      <td>${record.player2}</td>
      <td class="winner-cell ${winnerClass}">${record.winner}</td>
      <td><span class="mode-badge">${modeText}</span></td>
    `;

    tbody.appendChild(tr);
  });
}

function clearRecords() {
  if (!confirm('Очистить всю историю?')) return;
  Storage.remove('records');
  loadRecords();
}

loadRecords();