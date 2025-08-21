document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentPlayerName = '';
    let currentTotalScore = 0;
    let currentMaxScore = 0;
    let allPlayers = {};
    let activeGameLoop = null; // To hold setInterval or requestAnimationFrame ID
    let activeKeydownHandler = null; // To manage the global keydown listener

    // --- DOM ELEMENT REFERENCES ---
    const app = {
        screens: {
            playerSelection: document.getElementById('player-selection-screen'),
            createPlayer: document.getElementById('create-player-screen'),
            menu: document.getElementById('main-menu'),
        },
        displays: {
            playerInfo: document.getElementById('player-info'), // <-- MODIFICATION: Added reference to the container
            name: document.getElementById('player-name-display'),
            score: document.getElementById('score-display'),
            playerList: document.getElementById('player-list'),
        },
        buttons: {
            createNewPlayer: document.getElementById('create-new-player-btn'),
            startNewPlayer: document.getElementById('start-new-player-btn'),
            backToSelection: document.getElementById('back-to-selection-btn'),
            switchPlayer: document.getElementById('switch-player-btn'),
            gameBtns: document.querySelectorAll('.game-btn'),
            backToMenu: document.getElementById('back-to-menu'),
        },
        gameArea: document.getElementById('game-area'),
        inputs: {
            playerName: document.getElementById('player-name-input'),
        }
    };

    // --- DATA & STATE LOGIC ---
    function saveAllPlayers() {
        if (currentPlayerName) {
            allPlayers[currentPlayerName] = { totalScore: currentTotalScore, maxScore: currentMaxScore };
        }
        localStorage.setItem('gameHubPlayers', JSON.stringify(allPlayers));
    }
    function loadAllPlayers() {
        const storedPlayers = localStorage.getItem('gameHubPlayers');
        allPlayers = storedPlayers ? JSON.parse(storedPlayers) : {};
    }

    // <-- MODIFICATION START: Updated the updateHeaderDisplay function -->
    function updateHeaderDisplay() {
        if (currentPlayerName) {
            // If a player is selected, show the info and update the text
            app.displays.playerInfo.style.display = 'block';
            app.displays.name.textContent = `Player: ${currentPlayerName}`;
            app.displays.score.textContent = `Score: ${currentTotalScore}/${currentMaxScore}`;
        } else {
            // If no player is selected, hide the entire info div
            app.displays.playerInfo.style.display = 'none';
        }
    }
    // <-- MODIFICATION END -->

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        if (screenId) document.getElementById(screenId).classList.add('active');
    }
    function showGame(gameId) {
        showScreen(null);
        app.gameArea.style.display = 'block';
        app.buttons.backToMenu.style.display = 'block';
        document.querySelectorAll('.game-screen').forEach(g => g.style.display = 'none');
        document.getElementById(gameId).style.display = 'block';
    }
    function selectPlayer(name) {
        currentPlayerName = name;
        currentTotalScore = allPlayers[name].totalScore;
        currentMaxScore = allPlayers[name].maxScore;
        updateHeaderDisplay();
        showScreen('main-menu');
    }
    function populatePlayerList() {
        app.displays.playerList.innerHTML = '';
        const playerNames = Object.keys(allPlayers);
        if (playerNames.length === 0) {
            app.displays.playerList.innerHTML = '<p>No players found. Create a new profile!</p>';
            return;
        }
        playerNames.forEach(name => {
            const playerData = allPlayers[name];
            const profileBtn = document.createElement('button');
            profileBtn.className = 'player-profile-btn';
            profileBtn.innerHTML = `<span class="player-name">${name}</span><span class="player-score">Score: ${playerData.totalScore}/${playerData.maxScore}</span>`;
            profileBtn.onclick = () => selectPlayer(name);
            app.displays.playerList.appendChild(profileBtn);
        });
    }
    function showPlayerSelectionScreen() {
        currentPlayerName = '';
        currentTotalScore = 0;
        currentMaxScore = 0;
        updateHeaderDisplay();
        populatePlayerList();
        showScreen('player-selection-screen');
    }

    // The main game launcher
    function launchGame(gameId) {
        if (activeGameLoop) { cancelAnimationFrame(activeGameLoop); clearInterval(activeGameLoop); activeGameLoop = null; }
        if (activeKeydownHandler) { document.removeEventListener('keydown', activeKeydownHandler); activeKeydownHandler = null; }
        switch (gameId) {
            case 'rps': initRpsGame(); break; case 'hangman': initHangmanGame(); break; case 'quiz': initQuizGame(); break; case 'tictactoe': initTictactoeGame(); break;
            case 'guess-number': initGuessNumberGame(); break; case 'memory': initMemoryGame(); break; case 'minesweeper': initMinesweeperGame(); break;
            case 'snake': initSnakeGame(); break; case 'brickbreaker': initBrickBreakerGame(); break; case 'connectfour': initConnectFourGame(); break;
            case 'sudoku': initSudokuGame(); break; case 'blackjack': initBlackjackGame(); break;
        }
        showGame(`${gameId}-game`);
    }

    // --- EVENT LISTENERS ---
    app.buttons.createNewPlayer.addEventListener('click', () => showScreen('create-player-screen'));
    app.buttons.backToSelection.addEventListener('click', showPlayerSelectionScreen);
    app.buttons.switchPlayer.addEventListener('click', () => {
        saveAllPlayers();
        showPlayerSelectionScreen();
    });
    app.buttons.startNewPlayer.addEventListener('click', () => {
        const name = app.inputs.playerName.value.trim();
        if (!name) { alert('Please enter a name.'); return; }
        if (allPlayers[name]) { alert('A player with this name already exists.'); return; }
        allPlayers[name] = { totalScore: 0, maxScore: 0 };
        saveAllPlayers();
        selectPlayer(name);
    });
    app.buttons.backToMenu.addEventListener('click', () => {
        if (activeGameLoop) {
            cancelAnimationFrame(activeGameLoop);
            clearInterval(activeGameLoop);
            activeGameLoop = null;
        }
        if (activeKeydownHandler) {
            document.removeEventListener('keydown', activeKeydownHandler);
            activeKeydownHandler = null;
        }
        app.gameArea.style.display = 'none';
        app.buttons.backToMenu.style.display = 'none';
        saveAllPlayers();
        updateHeaderDisplay();
        showScreen('main-menu');
    });
    app.buttons.gameBtns.forEach(button => {
        button.addEventListener('click', () => {
            const game = button.dataset.game;
            if (activeGameLoop) {
                cancelAnimationFrame(activeGameLoop);
                clearInterval(activeGameLoop);
                activeGameLoop = null;
            }
            if (activeKeydownHandler) {
                document.removeEventListener('keydown', activeKeydownHandler);
                activeKeydownHandler = null;
            }
            switch (game) {
                case 'rps': initRpsGame(); break;
                case 'hangman': initHangmanGame(); break;
                case 'quiz': initQuizGame(); break;
                case 'tictactoe': initTictactoeGame(); break;
                case 'guess-number': initGuessNumberGame(); break;
                case 'memory': initMemoryGame(); break;
                case 'minesweeper': initMinesweeperGame(); break;
                case 'snake': initSnakeGame(); break;
                case 'brickbreaker': initBrickBreakerGame(); break;
                case 'connectfour': initConnectFourGame(); break;
                case 'sudoku': initSudokuGame(); break;
                case 'blackjack': initBlackjackGame(); break;
            }
            showGame(`${game}-game`);
        });
    });

    // --- GAME IMPLEMENTATIONS ---

    function initRpsGame() {
        const buttons = document.querySelectorAll('#rps-game .rps-choices button');
        const resultDiv = document.getElementById('rps-result');
        const playAgainBtn = document.getElementById('rps-play-again');

        resultDiv.textContent = '';
        buttons.forEach(b => b.disabled = false);
        playAgainBtn.style.display = 'none';
        playAgainBtn.onclick = initRpsGame;
        
        buttons.forEach(button => {
            button.onclick = () => {
                const choices = ['r', 'p', 's'];
                const choiceMap = { r: 'Rock', p: 'Paper', s: 'Scissors' };
                const playerChoice = button.dataset.choice;
                const computerChoice = choices[Math.floor(Math.random() * choices.length)];
                let resultText;
                
                if (playerChoice === computerChoice) { resultText = "It's a draw!"; } 
                else if ((playerChoice === 'r' && computerChoice === 's') || (playerChoice === 'p' && computerChoice === 'r') || (playerChoice === 's' && computerChoice === 'p')) {
                    resultText = "You win!"; currentTotalScore++;
                } else { resultText = "Computer wins!"; }
                
                currentMaxScore++;
                resultDiv.innerHTML = `You chose ${choiceMap[playerChoice]}.<br>Computer chose ${choiceMap[computerChoice]}.<br><strong>${resultText}</strong>`;
                updateHeaderDisplay();
                buttons.forEach(b => b.disabled = true);
                playAgainBtn.style.display = 'inline-block';
            };
        });
    }

    function initHangmanGame() {
        const playAgainBtn = document.getElementById('hangman-play-again');
        playAgainBtn.style.display = 'none';
        playAgainBtn.onclick = initHangmanGame;
        
        const wordList = [{ word: "javascript", hint: "A popular web language" }, { word: "elephant", hint: "A large mammal" }];
        const hangmanParts = [
            '  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n========='
        ];
        let selectedWord, wordState, incorrectGuesses, remainingTries;
        const hintEl = document.getElementById('hangman-hint'), drawingEl = document.getElementById('hangman-drawing'), wordEl = document.getElementById('hangman-word'), guessesEl = document.getElementById('hangman-guesses'), inputEl = document.getElementById('hangman-input'), resultEl = document.getElementById('hangman-result');
        
        function setup() {
            const { word, hint } = wordList[Math.floor(Math.random() * wordList.length)];
            selectedWord = word; wordState = Array(word.length).fill('_'); incorrectGuesses = []; remainingTries = 6;
            hintEl.textContent = `Hint: ${hint}`; resultEl.textContent = ''; inputEl.value = ''; inputEl.disabled = false;
            updateDisplay();
        }
        function updateDisplay() {
            wordEl.textContent = wordState.join(' ');
            drawingEl.textContent = hangmanParts[6 - remainingTries];
            guessesEl.textContent = `Incorrect Guesses: ${incorrectGuesses.join(', ')}`;
        }
        function checkGameState() {
            let gameEnded = false;
            if (!wordState.includes('_')) {
                resultEl.textContent = `Congratulations! You guessed: ${selectedWord}`;
                currentTotalScore++; updateHeaderDisplay(); gameEnded = true;
            } else if (remainingTries <= 0) {
                resultEl.textContent = `Game Over! The word was: ${selectedWord}`; gameEnded = true;
            }
            if(gameEnded){ inputEl.disabled = true; playAgainBtn.style.display = 'inline-block'; }
        }
        function checkGuess(letter) {
            if (!/^[a-z]$/.test(letter) || incorrectGuesses.includes(letter) || wordState.includes(letter)) return;
            if (selectedWord.includes(letter)) { selectedWord.split('').forEach((char, i) => { if (char === letter) wordState[i] = letter; });
            } else { incorrectGuesses.push(letter); remainingTries--; }
            updateDisplay(); checkGameState();
        }
        inputEl.oninput = () => { checkGuess(inputEl.value.toLowerCase()); inputEl.value = ''; };
        setup(); currentMaxScore++; updateHeaderDisplay();
    }

    function initQuizGame() {
        const playAgainBtn = document.getElementById('quiz-play-again');
        playAgainBtn.style.display = 'none';
        playAgainBtn.onclick = initQuizGame;

        const allQuestions = [{ question: "Which bird lays the largest egg?", options: ["Owl", "Ostrich"], answer: 1 }, { question: "Who painted the Mona Lisa?", options: ["da Vinci", "Picasso"], answer: 0 }];
        let availableQuestions = [...allQuestions], quizScore = 0;
        const questionEl = document.getElementById('quiz-question'), optionsEl = document.getElementById('quiz-options'), resultEl = document.getElementById('quiz-result');
        
        function showNextQuestion() {
            if (availableQuestions.length === 0) {
                resultEl.textContent = `Quiz Complete! Score: ${quizScore}/${allQuestions.length}.`;
                currentTotalScore += quizScore; updateHeaderDisplay(); questionEl.textContent = ''; optionsEl.innerHTML = '';
                playAgainBtn.style.display = 'inline-block';
                return;
            }
            const q = availableQuestions.splice(Math.floor(Math.random() * availableQuestions.length), 1)[0];
            questionEl.textContent = q.question; optionsEl.innerHTML = ''; resultEl.textContent = '';
            q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.textContent = opt; btn.onclick = () => checkAnswer(q, i, btn); optionsEl.appendChild(btn);
            });
        }
        function checkAnswer(q, sel, btn) {
            Array.from(optionsEl.children).forEach(b => b.disabled = true);
            if (sel === q.answer) { btn.classList.add('correct'); quizScore++; resultEl.textContent = "Correct!";
            } else { btn.classList.add('incorrect'); optionsEl.children[q.answer].classList.add('correct'); resultEl.textContent = `Incorrect! Answer: ${q.options[q.answer]}.`; }
            setTimeout(showNextQuestion, 2000);
        }
        currentMaxScore += allQuestions.length; updateHeaderDisplay(); showNextQuestion();
    }

    function initTictactoeGame() {
        const boardEl = document.getElementById('tictactoe-board'), statusEl = document.getElementById('tictactoe-status'), restartBtn = document.getElementById('tictactoe-restart');
        let board, currentPlayer, gameActive;
        function setup() {
            board = Array(9).fill(''); currentPlayer = 'X'; gameActive = true;
            statusEl.textContent = `Player ${currentPlayer}'s turn`; restartBtn.style.display = 'none';
            boardEl.innerHTML = '';
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('div'); cell.className = 'tictactoe-cell'; cell.dataset.index = i;
                cell.addEventListener('click', handleCellClick); boardEl.appendChild(cell);
            }
        }
        function handleCellClick(e) {
            const i = e.target.dataset.index;
            if (board[i] !== '' || !gameActive) return;
            board[i] = currentPlayer; e.target.textContent = currentPlayer;
            if (checkWin()) {
                statusEl.textContent = `Player ${currentPlayer} wins!`; currentTotalScore++; gameActive = false; updateHeaderDisplay(); restartBtn.style.display = 'inline-block';
            } else if (board.every(cell => cell)) {
                statusEl.textContent = "It's a draw!"; gameActive = false; restartBtn.style.display = 'inline-block';
            } else { currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; statusEl.textContent = `Player ${currentPlayer}'s turn`; }
        }
        function checkWin() { const win=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; return win.some(c=>c.every(i=>board[i]===currentPlayer)); }
        restartBtn.onclick = setup; setup(); currentMaxScore++; updateHeaderDisplay();
    }

    function initGuessNumberGame() {
        const number = Math.floor(Math.random() * 100) + 1;
        const inputEl = document.getElementById('guess-input'), submitBtn = document.getElementById('guess-submit'), resultEl = document.getElementById('guess-result'), playAgainBtn = document.getElementById('guess-play-again');
        
        inputEl.value = ''; resultEl.textContent = 'Make a guess!'; submitBtn.disabled = false; playAgainBtn.style.display = 'none';
        playAgainBtn.onclick = initGuessNumberGame;

        submitBtn.onclick = () => {
            const guess = parseInt(inputEl.value, 10);
            if (isNaN(guess)) { resultEl.textContent = "Please enter a valid number."; return; }
            if (guess < number) { resultEl.textContent = "Too low! Try again.";
            } else if (guess > number) { resultEl.textContent = "Too high! Try again.";
            } else { 
                resultEl.textContent = `Correct! The number was ${number}.`; currentTotalScore++; submitBtn.disabled = true;
                playAgainBtn.style.display = 'inline-block'; updateHeaderDisplay();
            }
            inputEl.value = ''; inputEl.focus();
        };
        currentMaxScore++; updateHeaderDisplay();
    }
    
    function initMemoryGame() {
        const boardEl = document.getElementById('memory-board'), resultEl = document.getElementById('memory-result'), playAgainBtn = document.getElementById('memory-play-again');
        playAgainBtn.style.display = 'none';
        playAgainBtn.onclick = initMemoryGame;

        const symbols = ['A','B','C','D','A','B','C','D'];
        let flippedCards = [], matchedPairs = 0;

        function setup() {
            symbols.sort(() => Math.random() - 0.5);
            boardEl.innerHTML = ''; resultEl.textContent = 'Find all matching pairs!'; matchedPairs = 0;
            symbols.forEach(symbol => {
                const card = document.createElement('div'); card.className = 'memory-card'; card.dataset.symbol = symbol;
                card.innerHTML = `<div class="card-face card-back"></div><div class="card-face card-front">${symbol}</div>`;
                card.addEventListener('click', () => flipCard(card)); boardEl.appendChild(card);
            });
        }
        function flipCard(card) {
            if (flippedCards.length === 2 || card.classList.contains('is-flipped')) return;
            card.classList.add('is-flipped'); flippedCards.push(card);
            if (flippedCards.length === 2) checkForMatch();
        }
        function checkForMatch() {
            const [c1, c2] = flippedCards;
            if (c1.dataset.symbol === c2.dataset.symbol) {
                c1.classList.add('is-matched'); c2.classList.add('is-matched');
                matchedPairs++; flippedCards = [];
                if (matchedPairs === symbols.length / 2) {
                    resultEl.textContent = "Congratulations! You found all pairs!"; currentTotalScore++;
                    playAgainBtn.style.display = 'inline-block'; updateHeaderDisplay();
                }
            } else { setTimeout(() => { c1.classList.remove('is-flipped'); c2.classList.remove('is-flipped'); flippedCards = []; }, 1000); }
        }
        setup(); currentMaxScore++; updateHeaderDisplay();
    }
    
    function initMinesweeperGame() {
        const SIZE = 10, MINES = 15;
        const boardEl = document.getElementById('minesweeper-board'), minesLeftEl = document.getElementById('mines-left'), statusEl = document.getElementById('game-status'), restartBtn = document.getElementById('minesweeper-restart');
        let board, minesLeft, gameActive, firstClick;
        function setup() {
            board = Array.from({length:SIZE},()=>Array.from({length:SIZE},()=>({isMine:false, isRevealed:false, isFlagged:false, adjacentMines:0})));
            minesLeft = MINES; gameActive = true; firstClick = true;
            statusEl.textContent = 'Good Luck!'; minesLeftEl.textContent = `Mines: ${minesLeft}`;
            boardEl.innerHTML = ''; boardEl.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;
            for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) {
                const cell = document.createElement('div'); cell.className = 'mine-cell'; cell.dataset.row = r; cell.dataset.col = c;
                cell.addEventListener('click', handleCellClick); cell.addEventListener('contextmenu', handleRightClick);
                boardEl.appendChild(cell);
            }
        }
        function placeMines(initialR, initialC) {
            let placed = 0;
            while(placed < MINES) {
                const r = Math.floor(Math.random()*SIZE), c = Math.floor(Math.random()*SIZE);
                if (!board[r][c].isMine && !(Math.abs(r - initialR) <= 1 && Math.abs(c - initialC) <= 1)) {
                    board[r][c].isMine = true; placed++;
                }
            }
            for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) {
                if(board[r][c].isMine) continue;
                for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) if(r+dr>=0&&r+dr<SIZE&&c+dc>=0&&c+dc<SIZE&&board[r+dr][c+dc].isMine) board[r][c].adjacentMines++;
            }
        }
        function renderBoard() {
            for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) {
                const cell = board[r][c], el = boardEl.children[r*SIZE+c];
                el.className = 'mine-cell'; el.textContent = '';
                if(cell.isFlagged) { el.classList.add('flagged'); el.textContent='🚩'; }
                if(cell.isRevealed) {
                    el.classList.add('revealed');
                    if(cell.isMine) { el.classList.add('mine-hit'); el.textContent='💣'; }
                    else if(cell.adjacentMines > 0) { el.textContent=cell.adjacentMines; el.classList.add(`c${cell.adjacentMines}`); }
                }
            }
            minesLeftEl.textContent = `Mines: ${minesLeft}`;
        }
        function revealCell(r, c) {
            if(r<0||r>=SIZE||c<0||c>=SIZE||board[r][c].isRevealed||board[r][c].isFlagged) return;
            board[r][c].isRevealed = true;
            if(board[r][c].adjacentMines === 0) for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) if(!(dr===0&&dc===0)) revealCell(r+dr, c+dc);
        }
        function handleCellClick(e) {
            if (!gameActive) return; const r=parseInt(e.target.dataset.row),c=parseInt(e.target.dataset.col);
            if(board[r][c].isRevealed||board[r][c].isFlagged) return;
            if(firstClick) { placeMines(r,c); firstClick=false; }
            if(board[r][c].isMine) { endGame(false); board[r][c].isRevealed=true; }
            else { revealCell(r,c); checkWin(); }
            renderBoard();
        }
        function handleRightClick(e) {
            e.preventDefault(); if (!gameActive) return; const r=parseInt(e.target.dataset.row),c=parseInt(e.target.dataset.col);
            if(board[r][c].isRevealed) return;
            board[r][c].isFlagged ? (board[r][c].isFlagged=false,minesLeft++) : (minesLeft>0&&(board[r][c].isFlagged=true,minesLeft--));
            renderBoard();
        }
        function checkWin() {
            const revealedCount = board.flat().filter(c=>c.isRevealed).length;
            if(revealedCount===(SIZE*SIZE)-MINES) endGame(true);
        }
        function endGame(isWin) {
            gameActive=false;
            if(isWin) { statusEl.textContent="You Win!"; currentTotalScore++; }
            else { statusEl.textContent="Game Over!"; board.forEach(row=>row.forEach(c=>{if(c.isMine)c.isRevealed=true;})); }
            updateHeaderDisplay(); renderBoard();
        }
        setup(); restartBtn.onclick = setup; currentMaxScore++; updateHeaderDisplay();
    }

    function initSnakeGame() {
        const canvas = document.getElementById('snake-canvas'), scoreEl = document.getElementById('snake-score'), ctx = canvas.getContext('2d'), gridSize = 20, playAgainBtn = document.getElementById('snake-play-again');
        canvas.width = 400; canvas.height = 400;
        let snake, food, score, direction, nextDirection, gameActive;

        function setup() {
            snake = [{x:10, y:10}]; food = {}; score = 0; direction = {x:0, y:0}; nextDirection = {x:0, y:0}; gameActive = true;
            playAgainBtn.style.display = 'none';
            playAgainBtn.onclick = initSnakeGame;
            scoreEl.textContent = "Score: 0. Use Arrow Keys to Start!"; placeFood();
            if (activeGameLoop) clearInterval(activeGameLoop);
            if (activeKeydownHandler) document.removeEventListener('keydown', activeKeydownHandler);
            activeGameLoop = setInterval(gameLoop, 120);
            activeKeydownHandler = handleKeydown;
            document.addEventListener('keydown', activeKeydownHandler);
            draw();
        }

        function placeFood() {
            do {
                food = {
                    x: Math.floor(Math.random() * (canvas.width/gridSize)),
                    y: Math.floor(Math.random() * (canvas.height/gridSize))
                };
            } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
        }

        function gameLoop() {
            if (!gameActive) return;
            direction = nextDirection;
            if (direction.x === 0 && direction.y === 0) { draw(); return; }
            const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
            if (head.x<0||head.x>=canvas.width/gridSize||head.y<0||head.y>=canvas.height/gridSize||snake.some(s=>s.x===head.x&&s.y===head.y)) { endGame(); return; }
            snake.unshift(head);
            if (head.x===food.x&&head.y===food.y) { score++; currentTotalScore++; updateHeaderDisplay(); scoreEl.textContent=`Score: ${score}`; placeFood(); } else { snake.pop(); }
            draw();
        }
        
        function endGame() {
            gameActive=false; clearInterval(activeGameLoop); activeGameLoop=null; document.removeEventListener('keydown', activeKeydownHandler); activeKeydownHandler=null;
            scoreEl.textContent = `Game Over! Final Score: ${score}.`; playAgainBtn.style.display = 'inline-block';
        }
        function draw() {
            ctx.fillStyle='rgba(0,0,10,0.8)'; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle='#00ffff'; snake.forEach(s=>ctx.fillRect(s.x*gridSize,s.y*gridSize,gridSize-1,gridSize-1));
            ctx.fillStyle='#ff00ff'; ctx.fillRect(food.x*gridSize,food.y*gridSize,gridSize-1,gridSize-1);
        }

        function handleKeydown(e) {
            switch(e.key){
                case 'ArrowUp': if(direction.y === 0) nextDirection = {x:0, y:-1}; break;
                case 'ArrowDown': if(direction.y === 0) nextDirection = {x:0, y:1}; break;
                case 'ArrowLeft': if(direction.x === 0) nextDirection = {x:-1, y:0}; break;
                case 'ArrowRight': if(direction.x === 0) nextDirection = {x:1, y:0}; break;
            }
        }

        setup();
        currentMaxScore++;
        updateHeaderDisplay();
    }

    function initBrickBreakerGame() {
        const canvas=document.getElementById('brickbreaker-canvas'), infoEl=document.getElementById('brickbreaker-info'), ctx=canvas.getContext('2d'), playAgainBtn=document.getElementById('brickbreaker-play-again');
        canvas.width=600; canvas.height=400;
        let ball, paddle, bricks, score, lives;
        function setup() {
            score=0; lives=3; playAgainBtn.style.display = 'none';
            paddle={x:canvas.width/2-50,y:canvas.height-20,width:100,height:10}; ball={x:canvas.width/2,y:canvas.height-30,radius:8,dx:4,dy:-4};
            bricks=[];const rows=5,cols=8,w=60,h=20,p=10;
            for(let r=0;r<rows;r++){bricks[r]=[];for(let c=0;c<cols;c++)bricks[r][c]={x:c*(w+p)+35,y:r*(h+p)+30,width:w,height:h,visible:true};}
            updateInfo();
            if (activeGameLoop) cancelAnimationFrame(activeGameLoop);
            activeGameLoop = requestAnimationFrame(gameLoop);
        }
        function updateInfo() { infoEl.textContent=`Score: ${score} | Lives: ${lives}`; }
        function gameLoop() {
            ball.x+=ball.dx; ball.y+=ball.dy;
            if(ball.x+ball.radius>canvas.width||ball.x-ball.radius<0)ball.dx*=-1;
            if(ball.y-ball.radius<0)ball.dy*=-1;
            if(ball.y+ball.radius>canvas.height){
                lives--; updateInfo();
                if(lives<=0){infoEl.textContent=`Game Over! Final Score: ${score}`; activeGameLoop=null; playAgainBtn.style.display='inline-block'; return;}
                ball.x=canvas.width/2; ball.y=canvas.height-30; ball.dx=4; ball.dy=-4;
            }
            if(ball.y+ball.radius>paddle.y&&ball.x>paddle.x&&ball.x<paddle.x+paddle.width)ball.dy*=-1;
            let bricksLeft=false;
            bricks.forEach(row=>row.forEach(b=>{
                if(b.visible){bricksLeft=true;if(ball.x>b.x&&ball.x<b.x+b.width&&ball.y>b.y&&ball.y<b.y+b.height){b.visible=false;ball.dy*=-1;score+=10;currentTotalScore+=10;updateHeaderDisplay();updateInfo();}}
            }));
            if(!bricksLeft){infoEl.textContent=`You Win! Score: ${score}`;activeGameLoop=null;currentTotalScore+=100;updateHeaderDisplay();playAgainBtn.style.display='inline-block';return;}
            draw(); if(activeGameLoop)activeGameLoop=requestAnimationFrame(gameLoop);
        }
        function draw() {
            ctx.fillStyle = 'rgba(0,0,10,0.8)'; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = '#00ffff'; ctx.fillRect(paddle.x,paddle.y,paddle.width,paddle.height);
            ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2); ctx.fillStyle='#ff00ff'; ctx.fill(); ctx.closePath();
            bricks.forEach(row=>row.forEach(brick=>{ if(brick.visible){ ctx.fillStyle='#90ee90'; ctx.fillRect(brick.x,brick.y,brick.width,brick.height);}}));
        }
        canvas.onmousemove=e=>{let x=e.clientX-canvas.getBoundingClientRect().left;if(x>paddle.width/2&&x<canvas.width-paddle.width/2)paddle.x=x-paddle.width/2;};
        playAgainBtn.onclick = setup; setup();
    }
    
    function initConnectFourGame() {
        const boardEl=document.getElementById('connectfour-board'), statusEl=document.getElementById('connectfour-status'), playAgainBtn=document.getElementById('connectfour-play-again');
        const R=6,C=7; let board,player,active;
        function setup(){
            board=Array.from({length:R},()=>Array(C).fill(0)); player=1; active=true;
            statusEl.textContent=`Player 1's Turn (Magenta)`; boardEl.innerHTML='';
            playAgainBtn.style.display = 'none';
            for(let c=0;c<C;c++){
                const colEl=document.createElement('div'); colEl.className='connectfour-column'; colEl.dataset.col=c;
                colEl.addEventListener('click',handleClick);
                for(let r=0;r<R;r++){const slot=document.createElement('div');slot.className='connectfour-slot';colEl.appendChild(slot);}
                boardEl.appendChild(colEl);
            }
        }
        function handleClick(e){
            if(!active)return; const c=parseInt(e.currentTarget.dataset.col,10); let r=R-1; while(r>=0&&board[r][c]!==0)r--;
            if(r<0)return; board[r][c]=player; updateUI();
            if(checkWin(r,c)){ statusEl.textContent=`Player ${player} Wins!`; active=false; if(player===1)currentTotalScore++; updateHeaderDisplay(); playAgainBtn.style.display='inline-block';
            }else if(board.flat().every(cell=>cell!==0)){ statusEl.textContent="Draw!"; active=false; playAgainBtn.style.display='inline-block';
            }else{ player=player===1?2:1; statusEl.textContent=`Player ${player}'s Turn (${player===1?'Magenta':'Yellow'})`; }
        }
        function updateUI(){
            for(let r=0;r<R;r++) for(let c=0;c<C;c++){
                const slot = boardEl.children[c].children[r]; slot.className='connectfour-slot';
                if(board[r][c]===1)slot.classList.add('player1'); if(board[r][c]===2)slot.classList.add('player2');
            }
        }
        function checkWin(r,c){
            const p=board[r][c];
            const dirs=[{r:0,c:1},{r:1,c:0},{r:1,c:1},{r:1,c:-1}];
            for(const d of dirs){
                let count=1;
                for(let i=1;i<4;i++){ const nr=r+d.r*i,nc=c+d.c*i; if(nr<0||nr>=R||nc<0||nc>=C||board[nr][nc]!==p)break; count++; }
                for(let i=1;i<4;i++){ const nr=r-d.r*i,nc=c-d.c*i; if(nr<0||nr>=R||nc<0||nc>=C||board[nr][nc]!==p)break; count++; }
                if(count>=4)return true;
            }
            return false;
        }
        setup(); currentMaxScore++; updateHeaderDisplay();
    }
    
    function initSudokuGame() {
        const boardEl=document.getElementById('sudoku-board'),checkBtn=document.getElementById('sudoku-check-btn'),resetBtn=document.getElementById('sudoku-reset-btn');
        const pz=[[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]];
        const sol=[[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]];
        function setup(){
            boardEl.innerHTML='';
            for(let r=0;r<9;r++) for(let c=0;c<9;c++){
                const input=document.createElement('input'); input.type='text'; input.maxLength=1; input.className='sudoku-cell';
                if(pz[r][c]!==0){ input.value=pz[r][c]; input.disabled=true; input.classList.add('given'); }
                input.dataset.row=r; input.dataset.col=c;
                input.addEventListener('input', e => { e.target.value = e.target.value.replace(/[^1-9]/g, ''); });
                boardEl.appendChild(input);
            }
            checkBtn.disabled=false;
        }
        checkBtn.onclick=()=>{
            let isCorrect=true;
            document.querySelectorAll('#sudoku-board .sudoku-cell').forEach(i=>{
                const r=i.dataset.row; const c=i.dataset.col;
                const userVal = i.value === '' ? 0 : parseInt(i.value,10);
                if(userVal !== sol[r][c]) isCorrect=false;
            });
            if(isCorrect){ alert("Congratulations! You solved it!"); currentTotalScore++; updateHeaderDisplay(); checkBtn.disabled=true;}
            else{ alert("Not quite right. Keep trying!"); }
        };
        resetBtn.onclick=setup; setup(); currentMaxScore++; updateHeaderDisplay();
    }
    
    function initBlackjackGame() {
        const statusEl=document.getElementById('blackjack-status'),dealerScoreEl=document.getElementById('dealer-score'),playerScoreEl=document.getElementById('player-score'),dealerHandEl=document.getElementById('dealer-hand'),playerHandEl=document.getElementById('player-hand'),hitBtn=document.getElementById('blackjack-hit-btn'),standBtn=document.getElementById('blackjack-stand-btn'),newHandBtn=document.getElementById('blackjack-new-hand-btn');
        let deck,playerHand,dealerHand,active;
        function createDeck(){
            const s=['♥','♦','♣','♠'],r=['2','3','4','5','6','7','8','9','10','J','Q','K','A']; deck=[];
            s.forEach(suit=>r.forEach(rank=>deck.push({suit,rank}))); deck.sort(()=>Math.random()-0.5);
        }
        function getHandValue(hand){
            let val=0,aces=0;
            hand.forEach(c=>{ if(['J','Q','K'].includes(c.rank))val+=10; else if(c.rank==='A'){aces++;val+=11;} else val+=parseInt(c.rank,10); });
            while(val>21&&aces>0){val-=10;aces--;} return val;
        }
        function renderHand(hand,el,showAll=true){
            el.innerHTML='';
            hand.forEach((c,i)=>{
                const card=document.createElement('div'); card.className='card'; if(['♥','♦'].includes(c.suit))card.classList.add('red');
                if(!showAll&&i===0){card.style.backgroundColor='#555';}else{card.innerHTML=`<span class="suit">${c.suit}</span><span>${c.rank}</span><span class="suit rank">${c.suit}</span>`;}
                el.appendChild(card);
            });
        }
        function start(){
            createDeck(); playerHand=[deck.pop(),deck.pop()]; dealerHand=[deck.pop(),deck.pop()]; active=true;
            statusEl.textContent='Hit or Stand?'; hitBtn.disabled=false; standBtn.disabled=false; newHandBtn.style.display='none';
            updateUI();
            if(getHandValue(playerHand)===21)end("Player Blackjack! You win!",true);
        }
        function updateUI(showAll=false){
            renderHand(playerHand,playerHandEl); renderHand(dealerHand,dealerHandEl,showAll);
            playerScoreEl.textContent=getHandValue(playerHand);
            dealerScoreEl.textContent=showAll?getHandValue(dealerHand):'?';
        }
        function end(msg,win=false){
            active=false; hitBtn.disabled=true; standBtn.disabled=true; newHandBtn.style.display='inline-block';
            statusEl.textContent=msg; if(win)currentTotalScore++;
            updateUI(true); updateHeaderDisplay();
        }
        hitBtn.onclick=()=>{ if(!active)return; playerHand.push(deck.pop()); updateUI(); if(getHandValue(playerHand)>21)end("Bust! You lose.");};
        standBtn.onclick=()=>{
            if(!active)return;
            active = false; standBtn.disabled=true; hitBtn.disabled=true;
            let dealerValue = getHandValue(dealerHand);
            const dealerTurn = setInterval(() => {
                if (dealerValue >= 17) {
                    clearInterval(dealerTurn);
                    const pVal=getHandValue(playerHand);
                    if(dealerValue>21||pVal>dealerValue)end("You win!",true); else if(dealerValue>pVal)end("Dealer wins."); else end("Push (Draw).");
                } else {
                    dealerHand.push(deck.pop());
                    dealerValue = getHandValue(dealerHand);
                    updateUI(true);
                }
            }, 800);
        };
        newHandBtn.onclick=start; start(); currentMaxScore++; updateHeaderDisplay();
    }
    
    // --- INITIALIZATION ---
    loadAllPlayers();
    showPlayerSelectionScreen();
});
