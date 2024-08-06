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
            fireBullet(player1, 'right');
            break;
        case 'ArrowRight':
            fireBullet(player2, 'left');
            break;
    }
});

function movePlayer(player, distance) {
    let top = parseInt(window.getComputedStyle(player).top);
    player.style.top = `${top + distance}px`;
}

function fireBullet(player, direction) {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    gameContainer.appendChild(bullet);

    const playerRect = player.getBoundingClientRect();
    const gameContainerRect = gameContainer.getBoundingClientRect();

    bullet.style.top = `${playerRect.top - gameContainerRect.top + playerRect.height / 2 - 5}px`;
    bullet.style.left = direction === 'right' ? `${playerRect.right - gameContainerRect.left}px` : `${playerRect.left - gameContainerRect.left - 10}px`;

    const speed = 5;
    const move = () => {
        let left = parseInt(window.getComputedStyle(bullet).left);
        left += direction === 'right' ? speed : -speed;
        bullet.style.left = `${left}px`;

        // Check for collision with barriers
        if (checkCollisionWithBarriers(bullet) || checkCollision(bullet, direction === 'right' ? player2 : player1)) {
            bullet.remove();
            clearInterval(bulletInterval);
            if (checkCollision(bullet, direction === 'right' ? player2 : player1)) {
                if (direction === 'right') {
                    player1Score++;
                } else {
                    player2Score++;
                }
                updateScore();
                alert(`${direction === 'right' ? 'Player 1' : 'Player 2'} wins!`);
                resetGame();
            }
        }

        if (left < 0 || left > 800) {
            bullet.remove();
            clearInterval(bulletInterval);
        }
    };

    const bulletInterval = setInterval(move, 30);
}

function checkCollision(bullet, player) {
    const bulletRect = bullet.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    return (
        bulletRect.left < playerRect.right &&
        bulletRect.right > playerRect.left &&
        bulletRect.top < playerRect.bottom &&
        bulletRect.bottom > playerRect.top
    );
}

function checkCollisionWithBarriers(bullet) {
    const barriers = document.querySelectorAll('.tree, .obstacle');
    const bulletRect = bullet.getBoundingClientRect();

    for (let barrier of barriers) {
        const barrierRect = barrier.getBoundingClientRect();
        if (
            bulletRect.left < barrierRect.right &&
            bulletRect.right > barrierRect.left &&
            bulletRect.top < barrierRect.bottom &&
            bulletRect.bottom > barrierRect.top
        ) {
            return true;
        }
    }
    return false;
}

function resetGame() {
    const bullets = document.querySelectorAll('.bullet');
    bullets.forEach(bullet => bullet.remove());

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
