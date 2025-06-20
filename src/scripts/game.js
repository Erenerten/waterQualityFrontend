// Game Constants
const GRID_SIZE = 8;
const CANDY_TYPES = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
const MIN_MATCH = 3;
const MOVE_DURATION = 200;
const POINTS = {
  3: 30,
  4: 60,
  5: 100,
  6: 150
};

// Game State
let grid = [];
let score = 0;
let combo = 0;
let maxCombo = 0;
let timeLeft = 30;
let gameActive = true;
let draggedTile = null;
let dropTarget = null;

// Initialize game board
function createGrid() {
  const gameBoard = document.getElementById('game');
  if (!gameBoard) return;

  gameBoard.innerHTML = '';
  grid = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    const gridRow = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row.toString();
      cell.dataset.col = col.toString();
      
      const candy = createCandy();
      cell.appendChild(candy);
      
      gameBoard.appendChild(cell);
      gridRow.push(candy);

      // Add drag and drop handlers
      setupDragAndDrop(cell);
    }
    grid.push(gridRow);
  }

  // Initial board check
  setTimeout(checkBoard, 500);
}

// Create a new candy element
function createCandy() {
  const candy = document.createElement('div');
  candy.className = 'candy';
  const type = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
  candy.classList.add(type);
  return candy;
}

// Setup drag and drop handlers for a cell
function setupDragAndDrop(cell) {
  cell.addEventListener('dragstart', handleDragStart);
  cell.addEventListener('dragenter', handleDragEnter);
  cell.addEventListener('dragover', handleDragOver);
  cell.addEventListener('dragleave', handleDragLeave);
  cell.addEventListener('drop', handleDrop);
  cell.addEventListener('dragend', handleDragEnd);
}

// Drag and Drop Event Handlers
function handleDragStart(e) {
  if (!gameActive) return;
  draggedTile = e.target.closest('.cell');
  e.target.classList.add('dragging');
}

function handleDragEnter(e) {
  e.preventDefault();
}

function handleDragOver(e) {
  e.preventDefault();
  const cell = e.target.closest('.cell');
  if (cell && cell !== draggedTile) {
    cell.classList.add('drag-over');
    dropTarget = cell;
  }
}

function handleDragLeave(e) {
  const cell = e.target.closest('.cell');
  if (cell) {
    cell.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  const cell = e.target.closest('.cell');
  if (cell) {
    cell.classList.remove('drag-over');
  }
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  if (dropTarget) {
    if (isAdjacent(draggedTile, dropTarget)) {
      swapTiles(draggedTile, dropTarget);
    }
    dropTarget.classList.remove('drag-over');
    dropTarget = null;
  }
  draggedTile = null;
}

// Game Logic
function isAdjacent(tile1, tile2) {
  const row1 = parseInt(tile1.dataset.row);
  const col1 = parseInt(tile1.dataset.col);
  const row2 = parseInt(tile2.dataset.row);
  const col2 = parseInt(tile2.dataset.col);
  
  return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
}

async function swapTiles(tile1, tile2) {
  const candy1 = tile1.children[0];
  const candy2 = tile2.children[0];
  
  // Animate swap
  const rect1 = candy1.getBoundingClientRect();
  const rect2 = candy2.getBoundingClientRect();
  
  const deltaX = rect2.left - rect1.left;
  const deltaY = rect2.top - rect1.top;
  
  candy1.style.transition = `transform ${MOVE_DURATION}ms`;
  candy2.style.transition = `transform ${MOVE_DURATION}ms`;
  
  candy1.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  candy2.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
  
  await new Promise(resolve => setTimeout(resolve, MOVE_DURATION));
  
  // Actual swap
  tile1.appendChild(candy2);
  tile2.appendChild(candy1);
  
  candy1.style.transform = '';
  candy2.style.transform = '';
  
  // Check for matches
  const matches = findMatches();
  if (matches.length > 0) {
    await removeMatches(matches);
    await fillBoard();
    checkBoard();
  } else {
    // Swap back if no matches
    await new Promise(resolve => setTimeout(resolve, 100));
    tile2.appendChild(candy1);
    tile1.appendChild(candy2);
  }
}

function findMatches() {
  const matches = new Set();
  
  // Check rows
  for (let row = 0; row < GRID_SIZE; row++) {
    let count = 1;
    let type = grid[row][0].className.split(' ')[1];
    
    for (let col = 1; col < GRID_SIZE; col++) {
      const currentType = grid[row][col].className.split(' ')[1];
      
      if (currentType === type) {
        count++;
      } else {
        if (count >= MIN_MATCH) {
          for (let i = col - count; i < col; i++) {
            matches.add(grid[row][i]);
          }
        }
        count = 1;
        type = currentType;
      }
    }
    
    if (count >= MIN_MATCH) {
      for (let i = GRID_SIZE - count; i < GRID_SIZE; i++) {
        matches.add(grid[row][i]);
      }
    }
  }
  
  // Check columns
  for (let col = 0; col < GRID_SIZE; col++) {
    let count = 1;
    let type = grid[0][col].className.split(' ')[1];
    
    for (let row = 1; row < GRID_SIZE; row++) {
      const currentType = grid[row][col].className.split(' ')[1];
      
      if (currentType === type) {
        count++;
      } else {
        if (count >= MIN_MATCH) {
          for (let i = row - count; i < row; i++) {
            matches.add(grid[i][col]);
          }
        }
        count = 1;
        type = currentType;
      }
    }
    
    if (count >= MIN_MATCH) {
      for (let i = GRID_SIZE - count; i < GRID_SIZE; i++) {
        matches.add(grid[i][col]);
      }
    }
  }
  
  return Array.from(matches);
}

async function removeMatches(matches) {
  const points = POINTS[Math.min(matches.length, 6)];
  score += points;
  updateScore();
  
  // Update combo
  combo++;
  if (combo > maxCombo) maxCombo = combo;
  updateCombo();
  
  // Add time bonus for 4+ matches
  if (matches.length >= 4) {
    timeLeft = Math.min(timeLeft + 2, 30);
    updateTimer();
    showMessage('+2 Saniye Bonus!');
  }
  
  // Animate and remove matches
  matches.forEach(candy => {
    candy.classList.add('fade-out');
  });
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  matches.forEach(candy => {
    candy.remove();
  });
}

async function fillBoard() {
  // Drop existing candies
  for (let col = 0; col < GRID_SIZE; col++) {
    let emptyRow = GRID_SIZE - 1;
    
    while (emptyRow >= 0) {
      if (!grid[emptyRow][col].parentElement) {
        let fullRow = emptyRow - 1;
        
        while (fullRow >= 0 && !grid[fullRow][col].parentElement) {
          fullRow--;
        }
        
        if (fullRow >= 0) {
          const candy = grid[fullRow][col];
          const cell = document.querySelector(`[data-row="${emptyRow}"][data-col="${col}"]`);
          cell.appendChild(candy);
          grid[emptyRow][col] = candy;
        } else {
          break;
        }
      }
      emptyRow--;
    }
    
    // Fill empty spaces with new candies
    for (let row = 0; row >= 0; row--) {
      const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (!cell.hasChildNodes()) {
        const candy = createCandy();
        candy.classList.add('fade-in');
        cell.appendChild(candy);
        grid[row][col] = candy;
      }
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 300));
}

async function checkBoard() {
  const matches = findMatches();
  if (matches.length > 0) {
    await removeMatches(matches);
    await fillBoard();
    checkBoard();
  } else {
    combo = 0;
    updateCombo();
  }
}

// UI Updates
function updateScore() {
  const scoreElement = document.getElementById('score');
  if (scoreElement) {
    scoreElement.textContent = `Puan: ${score}`;
  }
  updateRank();
}

function updateCombo() {
  const comboElement = document.getElementById('combo');
  if (comboElement) {
    comboElement.textContent = `Kombo: ${combo}`;
  }
}

function updateRank() {
  const rankDisplay = document.getElementById('rank-display');
  if (!rankDisplay) return;
  
  rankDisplay.className = 'rank-display';
  
  if (score >= 3500) {
    rankDisplay.textContent = '🌊 Poseidon';
    rankDisplay.classList.add('rank-poseidon');
  } else if (score >= 3000) {
    rankDisplay.textContent = '🌊 Balık Adam';
    rankDisplay.classList.add('rank-fishman');
  } else if (score >= 2500) {
    rankDisplay.textContent = '🌊 Su Gardiyanı';
    rankDisplay.classList.add('rank-guardian');
  } else if (score >= 2000) {
    rankDisplay.textContent = '🌊 Su Koruyucusu';
    rankDisplay.classList.add('rank-protector');
  } else {
    rankDisplay.textContent = '🌊 Başlangıç';
    rankDisplay.classList.add('rank-beginner');
  }
}

function updateTimer() {
  const timerText = document.getElementById('timerText');
  const progressBar = document.getElementById('progressBar');
  
  if (timerText) {
    timerText.textContent = `${timeLeft}s`;
  }
  
  if (progressBar) {
    progressBar.style.height = `${(timeLeft / 30) * 100}%`;
  }
}

function showMessage(text) {
  const messageDisplay = document.getElementById('message-display');
  if (!messageDisplay) return;
  
  messageDisplay.textContent = text;
  messageDisplay.classList.add('show');
  
  setTimeout(() => {
    messageDisplay.classList.remove('show');
  }, 2000);
}

// Game Timer
function startTimer() {
  const timer = setInterval(() => {
    if (!gameActive) {
      clearInterval(timer);
      return;
    }
    
    timeLeft--;
    updateTimer();
    
    if (timeLeft <= 0) {
      gameActive = false;
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function endGame() {
  showMessage(`Oyun Bitti! Puan: ${score}`);
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.style.pointerEvents = 'none';
  });
}

// Game Initialization
export function initGame() {
  score = 0;
  combo = 0;
  maxCombo = 0;
  timeLeft = 30;
  gameActive = true;
  
  updateScore();
  updateCombo();
  updateTimer();
  createGrid();
  startTimer();
}