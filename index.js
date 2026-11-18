const WORD_LIST = [
  'Ação', 'Coração', 'Pão-de-ló', 'Talvez?', 'Extraordinário', 'Psicologia',
  'Paralelepípedo', 'Inconstitucionalissimamente', 'Otorrinolaringologista',
  '"Olá!"', 'São-Paulo', 'Rio de Janeiro', 'Ceará-Mirim', 'bem-te-vi', 'água-viva',
  'Criança', 'Lição', 'Português', 'Matemática', 'Ciências', 'História', 'Geografia',
  'Exceção', 'Êxito', 'Órgão', 'Bênção', 'sócio-econômico', 'super-homem',
  'anti-inflamatório', 'micro-ondas', 'guarda-chuva', 'pé-de-moleque', 'vitória-régia',
  'açúcar', 'cabeçalho', 'endereço', 'maçã', 'alguém', 'armazém', 'também', 'ninguém',
  'órfão', 'cãibra', 'ímã', 'pôr', 'pôde', 'vovô', 'vovó', 'ônibus', 'lâmpada', 'câmera',
  'pêssego', 'rápido', 'médico', 'público', 'árvore', 'fácil', 'difícil', 'caráter',
  'tórax', 'vírus', 'bônus', 'hífen', 'pólen', 'elétrons', 'prótons', 'nêutrons',
  'influência', 'consequência', 'frequência', 'linguiça', 'tranquilo', 'pinguim',
  'joão-de-barro', 'mico-leão-dourado', 'arranha-céu', 'bate-papo', 'água-de-colônia',
  'caminhão-pipa', 'Quixadá', 'Chapéu', 'Céu', 'Herói', 'Anzóis', 'Anéis', 'Fiéis',
  'Papéis', 'Joia', 'Ideia', 'Boia', 'Jiboia', 'Assembleia', 'Europeia', 'Paranoia',
  'Gratuito', 'Fortuito', 'Circuito', 'Fluido', 'Juiz', 'Raiz', 'Rainha', 'ainda',
  'atraiu', 'distraído', 'saúde', 'baú', 'balaústre', 'conteúdo', 'miúdo', 'saída',
  'cafeína', 'faísca', 'graúdo', 'país', 'Piauí', 'Tuiuiú', 'proteína', 'reúne',
  'influí', 'possuí', 'constituí', 'distribuí', 'atribuí', 'retribuí', 'Família',
  'Amizade', 'Férias', 'Brincadeira', 'Chocolate', 'Música', 'Canção', 'Poesia',
  'Astronauta', 'Biblioteca', 'Aniversário', 'Elétrico', 'Fotografia', 'Geleia',
  'Hipopótamo', 'Hortelã', 'Máquina', 'Natureza', 'Pássaro', 'Relógio', 'Televisão',
  'Universidade', 'Xícara', 'Zoológico', 'Açaí', 'Guaraná',
];

const GameState = {
  Config: 'CONFIG',
  Typing: 'TYPING',
  Results: 'RESULTS',
};

// --- DOM Elements ---
const configScreen = document.getElementById('config-screen');
const typingScreen = document.getElementById('typing-screen');
const resultsScreen = document.getElementById('results-screen');

const durationRange = document.getElementById('duration-range');
const durationDisplay = document.getElementById('duration-display');
const startButton = document.getElementById('start-button');

const timerDisplay = document.getElementById('timer-display');
const currentWordDisplay = document.getElementById('current-word-display');
const nextWordsDisplay = document.getElementById('next-words-display');
const typingInput = document.getElementById('typing-input');
const wordArea = document.getElementById('word-area');

const accuracyDisplay = document.getElementById('accuracy-display');
const correctWordsDisplay = document.getElementById('correct-words-display');
const incorrectWordsDisplay = document.getElementById('incorrect-words-display');
const restartButton = document.getElementById('restart-button');

// --- State Variables ---
let gameState = GameState.Config;
let testDuration = 60; // in seconds
let timeLeft = 0;
let timerInterval = null;

let words = [];
let currentWordIndex = 0;
let correctWords = 0;
let incorrectWords = 0;

// --- Functions ---

function updateScreen() {
  configScreen.classList.toggle('hidden', gameState !== GameState.Config);
  typingScreen.classList.toggle('hidden', gameState !== GameState.Typing);
  resultsScreen.classList.toggle('hidden', gameState !== GameState.Results);
}

function formatDuration(d) {
    if (d === 0.5) return '30 segundos';
    if (d === 1) return '1 minuto';
    return `${d} minutos`;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function renderWords() {
    const currentWord = words[currentWordIndex];
    const inputValue = typingInput.value;

    // Render current word with character feedback
    currentWordDisplay.innerHTML = '';
    if (currentWord) {
        currentWord.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            if (index < inputValue.length) {
                span.className = char === inputValue[index] ? 'text-green-400' : 'text-red-400 bg-red-900/50 rounded-sm';
            } else {
                span.className = 'text-gray-400';
            }
            currentWordDisplay.appendChild(span);
        });
    }

    // Render next words
    nextWordsDisplay.innerHTML = '';
    words.slice(currentWordIndex + 1, currentWordIndex + 6).forEach(word => {
        const span = document.createElement('span');
        span.textContent = word;
        nextWordsDisplay.appendChild(span);
    });
}


function checkWord() {
    const typedWord = typingInput.value.trim();
    const currentWord = words[currentWordIndex];

    if (typedWord === currentWord) {
        correctWords++;
    } else {
        incorrectWords++;
    }

    currentWordIndex++;
    typingInput.value = '';
    renderWords();
}


function finishTest() {
    clearInterval(timerInterval);
    timerInterval = null;
    typingInput.disabled = true;
    
    // Check the partially typed word when time runs out
    const typedWord = typingInput.value.trim();
    if (typedWord && words[currentWordIndex]) {
        if (typedWord === words[currentWordIndex]) {
            correctWords++;
        } else {
            incorrectWords++;
        }
    }

    showResults();
}

function showResults() {
    const totalWordsAttempted = correctWords + incorrectWords;
    const accuracy = totalWordsAttempted > 0 ? ((correctWords / totalWordsAttempted) * 100) : 0;

    accuracyDisplay.textContent = `${accuracy.toFixed(2)}%`;
    correctWordsDisplay.textContent = correctWords;
    incorrectWordsDisplay.textContent = incorrectWords;
    
    gameState = GameState.Results;
    updateScreen();
}

function startTest() {
    // Reset state
    timeLeft = testDuration;
    words = [...WORD_LIST].sort(() => Math.random() - 0.5);
    currentWordIndex = 0;
    correctWords = 0;
    incorrectWords = 0;
    typingInput.value = '';
    typingInput.disabled = false;
    
    // Initial render
    updateTimerDisplay();
    renderWords();
    
    // Change screen and focus input
    gameState = GameState.Typing;
    updateScreen();
    typingInput.focus();

    // Start timer
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            finishTest();
        }
    }, 1000);
}


// --- Event Listeners ---
durationRange.addEventListener('input', () => {
    const duration = parseFloat(durationRange.value);
    durationDisplay.textContent = formatDuration(duration);
});

startButton.addEventListener('click', () => {
    testDuration = parseFloat(durationRange.value) * 60;
    startTest();
});

restartButton.addEventListener('click', () => {
    gameState = GameState.Config;
    updateScreen();
});

typingInput.addEventListener('input', () => {
    renderWords();
});

typingInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (timeLeft > 0) {
            checkWord();
        }
    }
});

wordArea.addEventListener('click', () => {
    typingInput.focus();
});


// --- Initial Setup ---
updateScreen();
