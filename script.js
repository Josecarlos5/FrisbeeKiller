
document.addEventListener("DOMContentLoaded", () => {
    const player1 = document.getElementById("player1");
    const player2 = document.getElementById("player2");
    const bullet1 = document.getElementById("bullet1");
    const bullet2 = document.getElementById("bullet2");
    const player1ScoreElem = document.getElementById("player1-score");
    const player2ScoreElem = document.getElementById("player2-score");

    let player1Score = 0;
    let player2Score = 0;

    let bullet1Interval;
    let bullet2Interval;

    function movePlayer(player, direction) {
        const step = 10;
        const currentLeft = parseInt(window.getComputedStyle(player).left);
        const currentTop = parseInt(window.getComputedStyle(player).top);
        let newLeft = currentLeft;
        let newTop = currentTop;

        switch (direction) {
            case "left":
                newLeft = currentLeft - step;
                if (newLeft >= 0) player.style.left = `${newLeft}px`;
                break;
            case "right":
                newLeft = currentLeft + step;
                if (newLeft <= (800 - 50)) player.style.left = `${newLeft}px`;
                break;
            case "up":
                newTop = currentTop - step;
                if (newTop >= 0) player.style.top = `${newTop}px`;
                break;
            case "down":
                newTop = currentTop + step;
                if (newTop <= (400 - 50)) player.style.top = `${newTop}px`;
                break;
        }
    }

    function shootBullet(player, bullet) {
        if (bullet.style.display === "none") {
            bullet.style.display = "block";
            bullet.style.left = player.style.left;
            bullet.style.top = player.style.top;
            moveBullet(bullet, player.id === "player1" ? "right" : "left");
        }
    }

    function moveBullet(bullet, direction) {
        clearInterval(direction === "right" ? bullet1Interval : bullet2Interval);
        const step = 5;
        const move = () => {
            const currentLeft = parseInt(window.getComputedStyle(bullet).left);
            const newLeft = direction === "right" ? currentLeft + step : currentLeft - step;
            if (newLeft < 0 || newLeft > 800) {
                bullet.style.display = "none";
                clearInterval(direction === "right" ? bullet1Interval : bullet2Interval);
            } else {
                bullet.style.left = `${newLeft}px`;
                detectHit(bullet, direction === "right" ? player2 : player1);
            }
        };
        direction === "right" ? bullet1Interval = setInterval(move, 10) : bullet2Interval = setInterval(move, 10);
    }

    function detectHit(bullet, player) {
        const bulletRect = bullet.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        if (bulletRect.left < playerRect.right && bulletRect.right > playerRect.left &&
            bulletRect.top < playerRect.bottom && bulletRect.bottom > playerRect.top) {
            bullet.style.display = "none";
            if (player.id === "player1") {
                player2Score++;
                player2ScoreElem.textContent = `Player 2: ${player2Score}`;
            } else {
                player1Score++;
                player1ScoreElem.textContent = `Player 1: ${player1Score}`;
            }
        }
    }

    document.addEventListener("keydown", (e) => {
        switch (e.key) {
            case "a":
                movePlayer(player1, "left");
                break;
            case "d":
                movePlayer(player1, "right");
                break;
            case "w":
                movePlayer(player1, "up");
                break;
            case "s":
                movePlayer(player1, "down");
                break;
            case " ":
                shootBullet(player1, bullet1);
                break;
            case "ArrowLeft":
                movePlayer(player2, "left");
                break;
            case "ArrowRight":
                movePlayer(player2, "right");
                break;
            case "ArrowUp":
                movePlayer(player2, "up");
                break;
            case "ArrowDown":
                movePlayer(player2, "down");
                break;
            case "Enter":
                shootBullet(player2, bullet2);
                break;
        }
    });
});
