
// Get references to game elements
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const gameContainer = document.getElementById('game-container');
const getReady = document.getElementById('get-ready');
const player1ScoreElement = document.getElementById('player1-score');
const chronometerElement = document.getElementById('chronometer');
const gameOverScreen = document.createElement('div');  // Create the Game Over screen element

// Get references to audio elements
const stepSound = document.getElementById('step-sound');
const fireSound = document.getElementById('fire-sound');
const hitSound = document.getElementById('hit-sound');
const backgroundSound = document.getElementById('background-sound');

let player1Score = 0;
let timeLimit = 60000; // 1 minute in milliseconds
let remainingTime = 60; // Countdown timer in seconds
let timerInterval;

// Start the game when the window loads
window.onload = () => {
    // Detect if the user is on a mobile device
    if (isMobileDevice()) {
        // Set up touch controls for mobile
        gameContainer.addEventListener('touchstart', handleTouchStart, false);
        gameContainer.addEventListener('touchmove', handleTouchMove, false);
        gameContainer.addEventListener('touchend', handleTouchEnd, false);
    } else {
        // Set up keyboard controls for desktop/laptop
        document.addEventListener('keydown', handleKeyDown);
    }

    // Set up the background music to start on user interaction
    document.addEventListener('click', startBackgroundMusic);
    document.addEventListener('keydown', startBackgroundMusic);

    // Start AI control for Player 2
    startAIForPlayer2();

    // Start the chronometer
    timerInterval = setInterval(updateChronometer, 1000);

    // Start the game timer
    setTimeout(endGame, timeLimit);  // End the game after 1 minute
};

function startBackgroundMusic() {
    if (!backgroundMusicStarted) {
        backgroundSound.play();
        backgroundMusicStarted = true;

        // Remove the event listeners once music starts
        document.removeEventListener('click', startBackgroundMusic);
        document.removeEventListener('keydown', startBackgroundMusic);
    }
}

// Detect if the user is on a mobile device
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// AI for Player 2 (automated movements and firing)
function startAIForPlayer2() {
    setInterval(() => {
        const randomMove = Math.random() > 0.5 ? -10 : 10;
        movePlayer(player2, randomMove); // Randomly move up or down
        stepSound.play();
    }, 500); // Move every 500ms

    setInterval(() => {
        fireFrisbee(player2, 'left'); // Fire towards Player 1
        fireSound.play();
    }, 2000); // Fire every 2 seconds
}

// Keyboard controls for laptop/desktop
function handleKeyDown(e) {
    switch (e.key) {
        case 'ArrowUp':
            movePlayer(player1, -10);
            stepSound.play();
            break;
        case 'ArrowDown':
            movePlayer(player1, 10);
            stepSound.play();
            break;
        case ' ':
            fireFrisbee(player1, 'right');
            fireSound.play();
            break;
    }
}

// Touch controls for mobile
function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    startX = firstTouch.clientX;
    startY = firstTouch.clientY;
}

function handleTouchMove(evt) {
    evt.preventDefault();
    const touch = evt.touches[0];
    const player = touch.clientX < window.innerWidth / 2 ? player2 : player1;
    const moveY = touch.clientY - startY;
    
    movePlayer(player, moveY);
    stepSound.play();
    
    startY = touch.clientY;
}

function handleTouchEnd(evt) {
    endX = evt.changedTouches[0].clientX;
    endY = evt.changedTouches[0].clientY;

    const direction = endX < window.innerWidth / 2 ? 'left' : 'right';
    const player = direction === 'left' ? player2 : player1;

    if (Math.abs(endY - startY) < 50) { // Small vertical movement means a tap, so fire frisbee
        fireFrisbee(player, direction);
        fireSound.play();
    }
}

// Function to move a player up or down
function movePlayer(player, distance) {
    let top = parseInt(window.getComputedStyle(player).top);
    player.style.top = `${top + distance}px`;
}

// Function to fire a frisbee from a player in a specific direction
function fireFrisbee(player, direction) {
    const frisbee = document.createElement('div');
    frisbee.classList.add('symbol');
    frisbee.id = 'frisbee';
    frisbee.innerHTML = '🥏';
    gameContainer.appendChild(frisbee);

    const playerRect = player.getBoundingClientRect();
    const gameContainerRect = gameContainer.getBoundingClientRect();

    frisbee.style.top = `${playerRect.top - gameContainerRect.top + playerRect.height / 2 - 10}px`;
    frisbee.style.left = direction === 'right' ? `${playerRect.right - gameContainerRect.left}px` : `${playerRect.left - gameContainerRect.left - 20}px`;

    const speed = 5;
    const move = () => {
        let left = parseInt(window.getComputedStyle(frisbee).left);
        left += direction === 'right' ? speed : -speed;
        frisbee.style.left = `${left}px`;

        // Check for collision with the other player
        if (checkCollision(frisbee, direction === 'right' ? player2 : player1)) {
            frisbee.remove();
            clearInterval(frisbeeInterval);
            hitSound.play();
            if (direction === 'right') {
                player1Score += 2; // Player 1 gains 2 points for killing Player 2
            } else {
                player1Score -= 1; // Player 1 loses 1 point for being killed by Player 2
            }
            updateScore();
            resetGame();  // Reset positions after a player is hit
        }

        // Check for collision with barriers or if the frisbee is out of bounds
        const hitBarrier = checkCollisionWithBarriers(frisbee);
        if (hitBarrier) {
            clearInterval(frisbeeInterval);
            frisbee.remove();
            // Gradually fade out the barrier
            fadeOutBarrier(hitBarrier);
        } else if (left < 0 || left > 800) {
            frisbee.remove();
            clearInterval(frisbeeInterval);
        }
    };

    const frisbeeInterval = setInterval(move, 30);
}

// Function to gradually fade out a barrier (tree, dog, squirrel)
function fadeOutBarrier(barrier) {
    let opacity = 1;
    const fadeInterval = setInterval(() => {
        opacity -= 0.05;
        if (opacity <= 0) {
            barrier.remove();
            clearInterval(fadeInterval);
        } else {
            barrier.style.opacity = opacity;
        }
    }, 50); // Reduce opacity every 50 milliseconds
}

// Function to check for collision between a frisbee and a player
function checkCollision(frisbee, player) {
    const frisbeeRect = frisbee.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    return (
        frisbeeRect.left < playerRect.right &&
        frisbeeRect.right > playerRect.left &&
        frisbeeRect.top < playerRect.bottom &&
        frisbeeRect.bottom > playerRect.top
    );
}

// Function to check for collision between a frisbee and barriers (trees, dog, squirrel)
function checkCollisionWithBarriers(frisbee) {
    const barriers = document.querySelectorAll('.tree, #dog1, #squirrel1');
    const frisbeeRect = frisbee.getBoundingClientRect();

    for (let barrier of barriers) {
        const barrierRect = barrier.getBoundingClientRect();
        if (
            frisbeeRect.left < barrierRect.right &&
            frisbeeRect.right > barrierRect.left &&
            frisbeeRect.top < barrierRect.bottom &&
            frisbeeRect.bottom > barrierRect.top
        ) {
            return barrier; // Return the hit barrier element
        }
    }
    return null;
}

// Function to reset the game
function resetGame() {
    // Remove all frisbees
    const frisbees = document.querySelectorAll('#frisbee');
    frisbees.forEach(frisbee => frisbee.remove());

    // Reset player positions
    player1.style.top = '50%';
    player2.style.top = '50%';

    getReady.style.display = 'block';
    setTimeout(() => getReady.style.display = 'none', 2000);  // Show "GET READY" message for 2 seconds
}

// Function to update the score display
function updateScore() {
    player1ScoreElement.innerText = player1Score;
}

// Function to update the chronometer
function updateChronometer() {
    remainingTime--;
    chronometerElement.innerText = `Time Left: ${remainingTime}s`;

    if (remainingTime <= 0) {
        clearInterval(timerInterval); // Stop the chronometer
    }
}

// Function to end the game and display the Game Over screen
function endGame() {
    clearInterval(timerInterval);  // Stop the chronometer

    // Remove all game elements
    gameContainer.innerHTML = '';

    // Display the Game Over screen with the final score
    gameOverScreen.classList.add('game-over');
    gameOverScreen.innerHTML = `
        <h1>Game Over</h1>
        <p>Final Score: ${player1Score}</p>
        <button onclick="restartGame()">Play Again</button>
    `;
    gameContainer.appendChild(gameOverScreen);
}

// Function to restart the game
function restartGame() {
    player1Score = 0;
    gameContainer.innerHTML = '';  // Clear the Game Over screen
    location.reload();  // Reload the page to restart the game
}
