window.onload = function () {

    var canvas = document.getElementById("tetris");
    var canvasContext = canvas.getContext('2d')

    setup = {
        boardHeight: 800,
        boardWidth: 400,
        lineColor: '#ffffff',
        lineDivideWidth: 2.5,

        startingPoint: 0,
        rowScores: [40, 100, 300, 400],
        frameInterval: 100,
        pauseTimeout: 3600000,
    }

    stone = {
        border: 1,
        maxCount: 4,

        countHeight: 32,
        countWidth: 16,

        sizeHeight: 0,
        sizeWidth: 0,

        lineColor: '#123456',
        lineWidth: 1,

        stoneForms: ['t', 'i', 'o', 's', 'z', 'j', 'l'],
        stoneColors: ['#00FFFF', '#8800FF', '#FFFF00', '#00ff00',
            '#FF0000', '#0000FF', '#FF8800']
    }

    //Hier werden die Berechnung durchgeführt /initialisiert wird im Objekt
    setup.startingPoint = Math.floor((stone.countWidth / 2) - 1);
    stone.sizeHeight = setup.boardHeight / stone.countHeight;
    stone.sizeWidth = setup.boardWidth / stone.countWidth;

    // Funktionen:
    function randomNumber(size) {
        return Math.round(Math.random() * Math.round(size - 1));
    }

    function drawStone(x, y, color) {
        //hier wird der Stein gezeichnet
        canvasContext.fillStyle = color;
        canvasContext.fillRect(x * stone.sizeWidth, y * stone.sizeHeight, stone.sizeWidth, stone.sizeHeight);

        //hier wird der border gezeichnet
        // todo: nur zeichnen, wenn Steinfarbe NICHT schwarz
        canvasContext.fillStyle = stone.lineColor;
        canvasContext.lineWidth = stone.lineWidth;
        canvasContext.strokeRect(x * stone.sizeWidth, y * stone.sizeHeight, stone.sizeWidth, stone.sizeHeight);
    }


    // Klassen:
    class Formation {
        orientation = 0;
        form = '';
        color = '';
        positionX = 0;
        positionY = 0;

        forms = {
            t: {
                // 0        1        2          -> y
                0: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
                //  0 1 2    0 1 2    0 1 2     -> x
                1: [[0, 1, 0],
                    [0, 1, 1],
                    [0, 1, 0]],
                2: [[0, 0, 0],
                    [1, 1, 1],
                    [0, 1, 0]],
                3: [[0, 1, 0],
                    [1, 1, 0],
                    [0, 1, 0]],
            },
            i: {
                0: [[0, 0, 0, 0],
                    [2, 2, 2, 2],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]],
                1: [[0, 0, 2, 0],
                    [0, 0, 2, 0],
                    [0, 0, 2, 0],
                    [0, 0, 2, 0]],
                2: [[0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [2, 2, 2, 2],
                    [0, 0, 0, 0]],
                3: [[0, 2, 0, 0],
                    [0, 2, 0, 0],
                    [0, 2, 0, 0],
                    [0, 2, 0, 0]],
            },
            o: {
                0: [[0, 3, 3, 0],
                    [0, 3, 3, 0],
                    [0, 0, 0, 0]],
                1: [[0, 3, 3, 0],
                    [0, 3, 3, 0],
                    [0, 0, 0, 0]],
                2: [[0, 3, 3, 0],
                    [0, 3, 3, 0],
                    [0, 0, 0, 0]],
                3: [[0, 3, 3, 0],
                    [0, 3, 3, 0],
                    [0, 0, 0, 0]],
            },
            s: {
                0: [[0, 4, 4],
                    [4, 4, 0],
                    [0, 0, 0]],
                1: [[0, 4, 0],
                    [0, 4, 4],
                    [0, 0, 4]],
                2: [[0, 0, 0],
                    [0, 4, 4],
                    [4, 4, 0]],
                3: [[4, 0, 0],
                    [4, 4, 0],
                    [0, 4, 0]],
            },
            z: {
                0: [[5, 5, 0],
                    [0, 5, 5],
                    [0, 0, 0]],
                1: [[0, 0, 5],
                    [0, 5, 5],
                    [0, 5, 0]],
                2: [[0, 0, 0],
                    [5, 5, 0],
                    [0, 5, 5]],
                3: [[0, 5, 0],
                    [5, 5, 0],
                    [5, 0, 0]],
            },
            j: {
                0: [[6, 0, 0],
                    [6, 6, 6],
                    [0, 0, 0]],
                1: [[0, 6, 6],
                    [0, 6, 0],
                    [0, 6, 0]],
                2: [[0, 0, 0],
                    [6, 6, 6],
                    [0, 0, 6]],
                3: [[0, 6, 0],
                    [0, 6, 0],
                    [6, 6, 0]],
            },
            l: {
                0: [[0, 0, 7],
                    [7, 7, 7],
                    [0, 0, 0]],
                1: [[0, 7, 0],
                    [0, 7, 0],
                    [0, 7, 7]],
                2: [[0, 0, 0],
                    [7, 7, 7],
                    [7, 0, 0]],
                3: [[7, 7, 0],
                    [0, 7, 0],
                    [0, 7, 0]],
            },
        }

        constructor(orientaion, form, x, y) {
            this.orientation = orientaion;
            // form-Zahl (0-6) in Buchstabe umwandeln:
            // stoneForms: ['t', 'i', 'o', 's', 'z', 'j', 'l']
            this.form = stone.stoneForms[form];
            this.color = stone.stoneColors[form];
            this.positionX = x;
            this.positionY = y;
        }

        draw() {
            for (let y = 0; y < this.forms[this.form][this.orientation].length; y++) {
                for (let x = 0; x < this.forms[this.form][this.orientation][y].length; x++) {
                    if (this.forms[this.form][this.orientation][y][x] !== 0) {
                        drawStone(this.positionX + x, this.positionY + y, this.color);
                    }
                }
            }
        }


    }

    class Game {

        fallingStone;
        nextStone;
        loop;
        run = false;
        pause;
        matrixTable = [];

        constructor(gameLoop, gameRun, gamePause) {
            this.loop = gameLoop;
            this.run = gameRun;
            this.pause = gamePause;
            for (let y = 0; y < stone.countHeight; y++) {
                this.matrixTable[y] = [];
                for (let x = 0; x < stone.countWidth; x++) {
                    this.matrixTable[y][x] = 0;
                }
            }
            this.fallingStone = new Formation(randomNumber(4), randomNumber(7), setup.startingPoint, 0);
            this.nextStone = new Formation(randomNumber(4), randomNumber(7), 18, 28);
        }

        collide() {
            let bottomOfStone = 0;
            for (let i = 0; i < this.fallingStone.forms[this.fallingStone.form][this.fallingStone.orientation].length; i++) {
                for (let j = 0; j < this.fallingStone.forms[this.fallingStone.form][this.fallingStone.orientation][i].length; j++) {
                    if (this.fallingStone.forms[this.fallingStone.form][this.fallingStone.orientation][i][j] > 0) {
                        bottomOfStone = i;
                    }
                }
            }

            //console.log(bottomOfStone + this.fallingStone.positionY);
            //console.log(stone.countHeight - 1);

            // has form arrived at bottom of matrixTable?
            if (bottomOfStone + this.fallingStone.positionY === (stone.countHeight - 1)) {
                this.newInterval(bottomOfStone);
            }
            // are there stones in the way?
            for (let y = 0; y <= bottomOfStone; y++) {
                for (let x = 0; x < this.fallingStone.forms[this.fallingStone.form][this.fallingStone.orientation][y].length; x++) {
                    if (this.fallingStone.forms[this.fallingStone.form][this.fallingStone.orientation][y][x] !== 0) {
                        if (this.matrixTable[y + this.fallingStone.positionY][x + this.fallingStone.positionX] !== 0) {
                            this.fallingStone.positionY--;
                            this.newInterval(bottomOfStone);
                        }
                    }
                }
            }
        }

        newInterval(bottomOfStone) {
            console.log(this.fallingStone.forms[this.fallingStone.form][this.fallingStone.orientation][0].length);

            // copy Formation into Matrix:
            for (let y = 0; y <= bottomOfStone; y++) {
                for (let x = 0; x < this.fallingStone.forms[this.fallingStone.form][this.fallingStone.orientation][y].length; x++) {
                    if (this.fallingStone.forms[this.fallingStone.form][this.fallingStone.orientation][y][x] !== 0) {
                        this.matrixTable[y + this.fallingStone.positionY][x + this.fallingStone.positionX] = this.fallingStone.color;
                    }
                }
            }
            // next Round:
            this.nextStone.positionX = setup.startingPoint;
            this.nextStone.positionY = 0;
            this.fallingStone = this.nextStone;
            this.nextStone = new Formation(randomNumber(4), randomNumber(7), 18, 28);
            console.log(this.matrixTable);

        }

        drawMatrix() {
            for (let y = 0; y < this.matrixTable.length; y++) {
                for (let x = 0; x < this.matrixTable[y].length; x++) {
                    if (this.matrixTable[y][x] !== 0) {
                        drawStone(x, y, this.matrixTable[y][x]);
                    }
                }
            }
            //console.log(this.matrixTable);
        }

        gameOver() {
            window.alert("Game Over!");
            clearInterval(this.loop);
            document.getElementById("button").disabled = false;
        }

        clear() {
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);     // https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
        }

        infoBoard() {
            // dividing Line:
            canvasContext.beginPath();
            canvasContext.moveTo(setup.boardWidth, 0);
            canvasContext.lineTo(setup.boardWidth, setup.boardHeight);
            canvasContext.fillStyle = '#ffffff';    //setup.lineColor;
            canvasContext.lineWidth = setup.lineDivideWidth;
            canvasContext.stroke();

            // Score

            // Level

            // Window next Stone

        }
    }

    // Welcome...
    var game = new Game(this.loop, true, false);

    document.getElementById("button").onclick = function () {

        var elem = document.getElementById("button");
        if (game.pause === false) {
            elem.innerHTML = "Pause";
            //game.pause = false;
            game.loop = setInterval(function () {
//                if (game.pause === true) {
//                   // printf("Pause");
//                }else{
                    if (game.run) {
                        game.clear();
                        game.collide();
                        game.infoBoard();
                        game.fallingStone.draw();
                        game.fallingStone.positionY++;
                        game.nextStone.draw();
                        game.drawMatrix();
                    } else {
                        game.gameOver();
                    }
//               }
           }, setup.frameInterval);
            // game.loop = setup.frameInterval; TIMEOUT
        } else {  // Game is in Pause-Mode:
            elem.innerHTML = "Continue";
            game.pause = true;
            game.loop = clearInterval();
            //game.loop = setInterval(function () {}, setup.pauseTimeout);
            // game.loop = setup.pauseTimeout; TIMEIN
        }
        // hint: playerReset(); ?


    };

    /*
        while(falling.positionY > stone.countHeight){
            falling.draw();
            falling.positionY++;
        }


     */


}
