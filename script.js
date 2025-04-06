document.addEventListener('DOMContentLoaded', () => {
    // Variáveis do jogo
    let timer;
    let timeLeft = 1800; // 30 minutos em segundos
    let isPaused = false;
    let currentDirection = 'across';
    let selectedCell = null;
    let crosswordData = [];
    let wordList = [];
    let score = 0;
    let completedWords = new Set();
    
    // Elementos DOM
    const boardElement = document.getElementById('board');
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const pauseButton = document.getElementById('pause-btn');
    const hintButton = document.getElementById('hint-btn');
    const checkButton = document.getElementById('check-btn');
    const currentClueElement = document.getElementById('current-clue');
    const acrossButton = document.getElementById('across-btn');
    const downButton = document.getElementById('down-btn');
    const keyboardElement = document.getElementById('keyboard');
    const deleteButton = document.getElementById('delete-btn');
    const nextCellButton = document.getElementById('next-cell-btn');
    const helpButton = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeModal = document.querySelector('.close');
    
    // Inicializar o jogo
    initGame();
    
    // Função para inicializar o jogo
    async function initGame() {
        // Carregar palavras do backend
        try {
            const response = await fetch('/get_words');
            const data = await response.json();
            wordList = data.words;
            
            // Gerar o tabuleiro
            generateBoard();
            createKeyboard();
            startTimer();
            setupEventListeners();
            
        } catch (error) {
            console.error('Erro ao carregar palavras:', error);
            // Usar palavras padrão se o backend falhar
            wordList = [
                { palavra: "AMOR", dica: "Sentimento intenso de afeto" },
                { palavra: "PAZ", dica: "Ausência de conflito" },
                { palavra: "SOL", dica: "Estrela que ilumina o dia" },
                { palavra: "LUA", dica: "Satélite natural da Terra" },
                { palavra: "MAR", dica: "Grande extensão de água salgada" }
            ];
            generateBoard();
            createKeyboard();
            startTimer();
            setupEventListeners();
        }
    }
    
    // Configurar listeners de eventos
    function setupEventListeners() {
        // Modal de ajuda
        helpButton.addEventListener('click', () => {
            helpModal.style.display = 'block';
        });
        
        closeModal.addEventListener('click', () => {
            helpModal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
        
        // Teclado físico
        document.addEventListener('keydown', handlePhysicalKeyboard);
    }
    
    // Gerar tabuleiro
    function generateBoard() {
        // Limpar tabuleiro
        boardElement.innerHTML = '';
        
        // Criar tabuleiro 10x10 (para melhor responsividade)
        const gridSize = 10;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Adicionar células pretas em padrão específico
                if ((row + col) % 5 === 0 || (row === col && row % 3 === 0)) {
                    cell.classList.add('black');
                } else {
                    cell.addEventListener('click', () => selectCell(cell, row, col));
                }
                
                boardElement.appendChild(cell);
            }
        }
        
        // Adicionar palavras aleatórias do wordList
        addWord(0, 0, 'across', wordList[0].palavra);
        addWord(2, 0, 'across', wordList[1].palavra);
        addWord(0, 0, 'down', wordList[2].palavra);
        addWord(4, 2, 'across', wordList[3].palavra);
        addWord(1, 3, 'down', wordList[4].palavra);
    }
    
    // Adicionar palavra ao tabuleiro
    function addWord(row, col, direction, word) {
        const cells = [];
        const gridSize = 10;
        
        for (let i = 0; i < word.length; i++) {
            const cellRow = direction === 'across' ? row : row + i;
            const cellCol = direction === 'across' ? col + i : col;
            
            // Verificar se a célula está dentro dos limites
            if (cellRow >= gridSize || cellCol >= gridSize) break;
            
            const cellIndex = cellRow * gridSize + cellCol;
            const cell = boardElement.children[cellIndex];
            
            if (cell && !cell.classList.contains('black')) {
                cell.dataset.letter = word[i];
                cell.dataset.word = word;
                cell.dataset.direction = direction;
                cell.dataset.dica = wordList.find(w => w.palavra === word)?.dica || '';
                
                if (direction === 'across') {
                    cell.dataset.wordPosition = `${row},${col}-across`;
                } else {
                    cell.dataset.wordPosition = `${row},${col}-down`;
                }
                
                // Adicionar número da palavra (apenas na primeira célula)
                if (i === 0) {
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'cell-number';
                    numberSpan.textContent = crosswordData.length + 1;
                    cell.appendChild(numberSpan);
                }
                
                cells.push(cell);
            }
        }
        
        crosswordData.push({
            word,
            direction,
            startRow: row,
            startCol: col,
            cells,
            dica: wordList.find(w => w.palavra === word)?.dica || ''
        });
    }
    
    // Atualizar pontuação
    function updateScore(points) {
        score += points;
        scoreElement.textContent = score;
        
        // Animação de feedback
        scoreElement.classList.add('score-update');
        setTimeout(() => {
            scoreElement.classList.remove('score-update');
        }, 300);
    }
    
    // Selecionar célula
    function selectCell(cell, row, col) {
        // Desselecionar todas as células
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('selected', 'highlighted');
        });
        
        // Selecionar célula clicada
        cell.classList.add('selected');
        selectedCell = cell;
        
        // Destacar palavra inteira
        const wordPosition = cell.dataset.wordPosition;
        if (wordPosition) {
            document.querySelectorAll(`.cell[data-word-position="${wordPosition}"]`).forEach(c => {
                c.classList.add('highlighted');
            });
        }
        
        // Mostrar dica
        if (cell.dataset.dica) {
            currentClueElement.textContent = cell.dataset.dica;
        }
        
        // Atualizar direção baseada na palavra selecionada
        if (cell.dataset.direction) {
            currentDirection = cell.dataset.direction;
            updateDirectionButtons();
        }
    }
    
    // Atualizar botões de direção
    function updateDirectionButtons() {
        if (currentDirection === 'across') {
            acrossButton.classList.add('active');
            downButton.classList.remove('active');
        } else {
            downButton.classList.add('active');
            acrossButton.classList.remove('active');
        }
    }
    
    // Criar teclado virtual
    function createKeyboard() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÇ';
        
        for (const letter of letters) {
            const key = document.createElement('button');
            key.textContent = letter;
            key.addEventListener('click', () => handleKeyPress(letter));
            keyboardElement.appendChild(key);
        }
        
        // Adicionar botão de apagar
        deleteButton.addEventListener('click', () => handleKeyPress('DELETE'));
        
        // Adicionar botão de próxima célula
        nextCellButton.addEventListener('click', moveToNextCell);
    }
    
    // Manipular pressionamento de tecla (virtual ou física)
    function handleKeyPress(key) {
        if (!selectedCell || selectedCell.classList.contains('black')) return;
        
        if (key === 'DELETE') {
            selectedCell.textContent = '';
            selectedCell.classList.remove('correct', 'incorrect');
        } else if (key.length === 1 && key.match(/[A-ZÇ]/i)) {
            selectedCell.textContent = key.toUpperCase();
            
            // Verificar se a letra está correta
            if (selectedCell.dataset.letter === key.toUpperCase()) {
                selectedCell.classList.add('correct');
                selectedCell.classList.remove('incorrect');
                updateScore(10); // 10 pontos por letra correta
                
                // Verificar se a palavra foi completada
                checkWordCompletion();
            } else {
                selectedCell.classList.remove('correct');
            }
            
            // Mover para a próxima célula automaticamente
            setTimeout(moveToNextCell, 100);
        }
    }
    
    // Verificar se a palavra foi completada
    function checkWordCompletion() {
        if (!selectedCell || !selectedCell.dataset.wordPosition) return;
        
        const wordPosition = selectedCell.dataset.wordPosition;
        const wordCells = document.querySelectorAll(`.cell[data-word-position="${wordPosition}"]`);
        
        const wordComplete = Array.from(wordCells).every(c => 
            c.textContent === c.dataset.letter
        );
        
        if (wordComplete && !completedWords.has(wordPosition)) {
            completedWords.add(wordPosition);
            updateScore(50); // 50 pontos bônus por palavra completa
            wordCells.forEach(c => c.classList.add('word-completed'));
            setTimeout(() => {
                wordCells.forEach(c => c.classList.remove('word-completed'));
            }, 1000);
        }
    }
    
    // Manipular teclado físico
    function handlePhysicalKeyboard(event) {
        if (event.key === 'ArrowRight') {
            moveToAdjacentCell(0, 1);
        } else if (event.key === 'ArrowLeft') {
            moveToAdjacentCell(0, -1);
        } else if (event.key === 'ArrowDown') {
            moveToAdjacentCell(1, 0);
        } else if (event.key === 'ArrowUp') {
            moveToAdjacentCell(-1, 0);
        } else if (event.key === 'Tab') {
            event.preventDefault();
            moveToNextCell();
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
            handleKeyPress('DELETE');
        } else if (event.key.length === 1 && event.key.match(/[A-Za-zÇç]/)) {
            handleKeyPress(event.key.toUpperCase());
        }
    }
    
    // Mover para célula adjacente
    function moveToAdjacentCell(rowDiff, colDiff) {
        if (!selectedCell) return;
        
        const currentRow = parseInt(selectedCell.dataset.row);
        const currentCol = parseInt(selectedCell.dataset.col);
        const newRow = currentRow + rowDiff;
        const newCol = currentCol + colDiff;
        
        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
            const newIndex = newRow * 10 + newCol;
            const newCell = boardElement.children[newIndex];
            
            if (newCell && !newCell.classList.contains('black')) {
                selectCell(newCell, newRow, newCol);
            }
        }
    }
    
    // Mover para próxima célula na palavra
    function moveToNextCell() {
        if (!selectedCell || !selectedCell.dataset.wordPosition) return;
        
        const [startRow, startCol, direction] = selectedCell.dataset.wordPosition.split(/-|,/);
        const currentRow = parseInt(selectedCell.dataset.row);
        const currentCol = parseInt(selectedCell.dataset.col);
        
        let nextRow, nextCol;
        
        if (direction === 'across') {
            nextRow = parseInt(startRow);
            nextCol = parseInt(startCol) + (currentCol - parseInt(startCol) + 1);
        } else {
            nextRow = parseInt(startRow) + (currentRow - parseInt(startRow) + 1);
            nextCol = parseInt(startCol);
        }
        
        // Verificar se estamos dentro dos limites da palavra
        const wordData = crosswordData.find(w => 
            w.startRow == startRow && 
            w.startCol == startCol && 
            w.direction === direction
        );
        
        if (!wordData) return;
        
        const wordLength = wordData.word.length;
        const isEndOfWord = direction === 'across' ? 
            (nextCol >= parseInt(startCol) + wordLength) : 
            (nextRow >= parseInt(startRow) + wordLength);
        
        if (isEndOfWord) return;
        
        // Selecionar próxima célula
        if (nextRow >= 0 && nextRow < 10 && nextCol >= 0 && nextCol < 10) {
            const newIndex = nextRow * 10 + nextCol;
            const newCell = boardElement.children[newIndex];
            
            if (newCell && !newCell.classList.contains('black')) {
                selectCell(newCell, nextRow, nextCol);
            }
        }
    }
    
    // Temporizador
    function startTimer() {
        updateTimerDisplay();
        timer = setInterval(() => {
            if (!isPaused && timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
                
                if (timeLeft === 0) {
                    endGame();
                }
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Pausar/jogar
    pauseButton.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Continuar' : 'Pausar';
    });
    
    // Dica
    hintButton.addEventListener('click', () => {
        if (selectedCell && timeLeft > 30) {
            timeLeft -= 30;
            updateTimerDisplay();
            
            if (selectedCell.dataset.letter) {
                selectedCell.textContent = selectedCell.dataset.letter;
                selectedCell.classList.add('correct');
                checkWordCompletion();
            }
        }
    });
    
    // Verificar
    checkButton.addEventListener('click', () => {
        let allCorrect = true;
        
        document.querySelectorAll('.cell:not(.black)').forEach(cell => {
            if (cell.dataset.letter) {
                if (cell.textContent !== cell.dataset.letter) {
                    allCorrect = false;
                    cell.classList.add('incorrect');
                    setTimeout(() => cell.classList.remove('incorrect'), 1000);
                }
            }
        });
        
        if (allCorrect) {
            endGame(true);
        }
    });
    
    // Alternar direção
    acrossButton.addEventListener('click', () => {
        currentDirection = 'across';
        updateDirectionButtons();
    });
    
    downButton.addEventListener('click', () => {
        currentDirection = 'down';
        updateDirectionButtons();
    });
    
    // Finalizar jogo
    function endGame(isWin = false) {
        clearInterval(timer);
        
        if (isWin) {
            // Bônus por tempo restante (1 ponto por segundo)
            const timeBonus = Math.floor(timeLeft);
            updateScore(timeBonus);
            
            setTimeout(() => {
                alert(`Parabéns! Você completou as palavras cruzadas!\nPontuação final: ${score}\nBônus por tempo restante: ${timeBonus}`);
            }, 500);
        } else {
            alert(`Tempo esgotado! Jogo encerrado.\nSua pontuação: ${score}`);
        }
    }
});