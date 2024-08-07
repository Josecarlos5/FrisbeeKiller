

const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const gameContainer = document.getElementById('game-container');
const getReady = document.getElementById('get-ready');
const player1ScoreElement = document.getElementById('player1-score');
const player2ScoreElement = document.getElementById('player2-score');

let player1Score = 0;
let player2Score = 0;

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            movePlayer(player1, -10);
            break;
        case 's':
            movePlayer(player1, 10);
            break;
        case 'ArrowUp':
            movePlayer(player2, -10);
            break;
        case 'ArrowDown':
            movePlayer(player2, 10);
            break;
        case 'd':
            fireFrisbee(player1, 'right');
            break;
        case 'ArrowLeft':
            fireFrisbee(player2, 'left');
            break;
    }
});

function movePlayer(player, distance) {
    let top = parseInt(window.getComputedStyle(player).top);
    player.style.top = `${top + distance}px`;
}

function fireFrisbee(player, direction) {
    const frisbee = document.createElement('div');
    frisbee.classList.add('symbol');
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

        if (checkCollision(frisbee, direction === 'right' ? player2 : player1)) {
            frisbee.remove();
            clearInterval(frisbeeInterval);
            if (direction === 'right') {
                player1Score++;
            } else {
                player2Score++;
            }
            updateScore();
            alert(`${direction === 'right' ? 'Player 1' : 'Player 2'} wins!`);
            resetGame();
        }

        if (checkCollisionWithBarriers(frisbee) || left < 0 || left > 800) {
            frisbee.remove();
            clearInterval(frisbeeInterval);
        }
    };

    const frisbeeInterval = setInterval(move, 30);
}

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

function checkCollisionWithBarriers(frisbee) {
    const barriers = document.querySelectorAll('.tree, .obstacle');
    const frisbeeRect = frisbee.getBoundingClientRect();

    for (let barrier of barriers) {
        const barrierRect = barrier.getBoundingClientRect();
        if (
            frisbeeRect.left < barrierRect.right &&
            frisbeeRect.right > barrierRect.left &&
            frisbeeRect.top < barrierRect.bottom &&
            frisbeeRect.bottom > barrierRect.top
        ) {
            return true;
        }
    }
    return false;
}

function resetGame() {
    const frisbees = document.querySelectorAll('.symbol:not(.tree):not(.player)');
    frisbees.forEach(frisbee => frisbee.remove());

    player1.style.top = '50%';
    player2.style.top = '50%';

    getReady.style.display = 'block';
    setTimeout(() => getReady.style.display = 'none', 2000);
}

function updateScore() {
    player1ScoreElement.innerText = player1Score;
    player2ScoreElement.innerText = player2Score;
}

resetGame();
