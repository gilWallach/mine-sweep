'use strict'

const MINE = '💥'
const FLAG = '🚩'
const LIFE = '💗'
const HINT = '💡'

var gBoard
var gSmily
var gtimerInterval

var gHighscoreLvl1 = localStorage.getItem('highscoreLvl1')
var gHighscoreLvl2 = localStorage.getItem('highscoreLvl2')
var gHighscoreLvl3 = localStorage.getItem('highscoreLvl3')

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    gameLost: false,
    gameWon: false,

    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,

    lives: 3,
    isHint: false,
    hintsCount: 3,
    safeClicksCount: 3,
}

function init() {
    gSmily = '🙂'
    gBoard = createBoard(gLevel.SIZE)
    renderBoard(gBoard)
}

function renderBoard(board) {
    document.querySelector('.smily').innerText = gSmily
    var strHTML = ``

    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`

        for (var j = 0; j < board[0].length; j++) {
            var dataAttribStr = `data-i="${i}" data-j="${j}"`
            strHTML += `\t<td class="cell" onClick="cellClicked(this, ${i}, ${j})" 
            oncontextmenu="cellMarked(this, ${i}, ${j})" ${dataAttribStr}></td>\n`
        }
        strHTML += '\n</tr>\n'
    }

    var elBoard = document.querySelector('table tbody')
    elBoard.innerHTML = strHTML
}

function cellClicked(elCell, i, j) {
    // first click
    elCell.classList.add('shown')
    if (!gGame.isOn && !gGame.gameLost ||
        !gGame.isOn && !gGame.gameWon) {

        gBoard[i][j].isShown = true

        gGame.isOn = true
        gGame.shownCount++
        addMines(gBoard, i, j)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        showTimer()

        // TODO make first cell cliked shown on DOM
    }
    // if cell is already clicked
    if (gBoard[i][j].isShown) return
    // if cell isn't clicked yet
    else {
        // TODO: switch cases maybe more clear
        // if cell is not mine
        if (!gBoard[i][j].isMine) {
            // if cell has mines around
            if (gBoard[i][j].minesAroundCount !== 0) {
                // Update the model
                gBoard[i][j].isShown = true
                gGame.shownCount++

                // Update the DOM
                elCell.innerText = `${gBoard[i][j].minesAroundCount}`

                checkGameOver()
            }
            // if cell has no mines around
            else {
                // Update the model
                gBoard[i][j].isShown = true
                gGame.shownCount++
                expandShown(gBoard, i, j)
                checkGameOver()
            }
            // Update the DOM
            elCell.classList.add('shown')
        }
        // if cell is mine
        else {
            // player has no lives
            elCell.innerText = `${MINE}`
            if (gGame.lives === 0 && !gGame.isHint) {
                // Update the model
                gGame.gameLost = true
                checkGameOver()
            }
            // player still has lives
            else {
                // if isHint === false
                if (!gGame.isHint) {
                    //update the model
                    gGame.lives--
                    elCell.isMarked = true
                    gGame.markedCount++

                    // // Update the DOM
                    elCell.innerText = MINE
                    var elMsg = document.querySelector('.msg')
                    elMsg.classList.add('red-bg')
                    elMsg.innerText = `You stepped on a mine! be careful \n You have ${gGame.lives} lives`

                    setTimeout(() => {
                        elMsg.innerText = ''
                        elMsg.classList.remove('red-bg')

                    }, 1000)

                    document.querySelector('.hearts').innerText = ''
                    for (var i = 0; i < gGame.lives; i++) {
                        document.querySelector('.hearts').innerText += `${LIFE}`
                    }
                }
            }
        }
    }
    // if isHint === true
    if (gGame.isHint) {
        showHints(gBoard, i, j)
        setTimeout(() => {
            hideHints(gBoard, i, j)
            elCell.classList.remove('shown')
            elCell.innerText = ''
            gGame.isHint = false
        }, 1000)
    }
}

function cellMarked(elCell, i, j) {
    // if cell isn't marked yet
    if (!gBoard[i][j].isMarked) {
        // Update the model
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        checkGameOver()

        // Update the DOM
        window.addEventListener('contextmenu', function (e) {
            elCell.innerText = `${FLAG}`
            e.preventDefault();
        }, false)
    }
    // if cell is already marked
    else {
        // Update the model
        gGame.markedCount--
        gBoard[i][j].isMarked = false

        // Update the DOM
        window.addEventListener('contextmenu', function (e) {
            elCell.innerText = ``
            e.preventDefault();
        }, false)
    }
}

function checkGameOver() {
    var msg
    var elMsg = document.querySelector('.msg')
    // Win
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === gLevel.SIZE ** 2 - gGame.markedCount) {
        // Update the model
        gGame.gameWon = true
        gGame.isOn = false
        setHighscore()
        clearInterval(gtimerInterval)

        // Update the DOM
        msg = 'You Win!'
        elMsg.innerText = msg
        gSmily = '😎'
        document.querySelector('.smily').innerText = gSmily
        elMsg.classList.add('msg-shown')
    }
    // Lose
    else if (gGame.gameLost) {
        // Update the model
        gGame.isOn = false
        clearInterval(gtimerInterval)

        // Update the DOM
        msg = 'You Lose...'
        elMsg.innerText = msg
        gSmily = '🤯'
        document.querySelector('.smily').innerText = gSmily
        elMsg.classList.add('msg-shown')
    }
}

function restartGame() {
    // in case player restarts in the middle of a round
    clearInterval(gtimerInterval)

    // reset model
    resetgGame()
    init()

    // reset DOM
    document.querySelector('.hearts').innerText = `${LIFE}${LIFE}${LIFE}`

    document.querySelector('.msg').innerText = ''
    document.querySelector('.msg').classList.remove('msg-shown')

    document.querySelector('.hints').innerText = `Hints: ${HINT}${HINT}${HINT}`
    
    document.querySelector('.safe-clicks-count span').innerText = gGame.safeClicksCount
    document.querySelector('.safe-click-btn').classList.remove('unavailable')

}

function expandShown(board, i, j) {
    var rowIdx = i
    var colIdx = j

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            var negs = []

            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            if (!gBoard[i][j].isShown) {
                //update the model
                gBoard[i][j].isShown = true
                negs.push(gBoard[i][j])
                gGame.shownCount += negs.length
            }

            // update the DOM
            var selector = `[data-i="${i}"][data-j="${j}"]`
            var elneg = document.querySelector(selector)

            if (gBoard[i][j].minesAroundCount !== 0) {
                elneg.innerText = `${gBoard[i][j].minesAroundCount}`
            }
            if (gBoard[i][j].isMine) {
                elneg.innerText = `${MINE}`
            }
            if (gBoard[i][j].isShown) {
                elneg.classList.add('shown')
            }
        }
    }
}

function showHints(board, i, j) {
    var rowIdx = i
    var colIdx = j

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            // update the DOM
            var selector = `[data-i="${i}"][data-j="${j}"]`
            var elneg = document.querySelector(selector)

            if (gBoard[i][j].minesAroundCount !== 0) {
                elneg.innerText = `${gBoard[i][j].minesAroundCount}`
            } else elneg.innerText = ''

            if (gBoard[i][j].isMine) {
                elneg.innerText = `${MINE}`
            }
            elneg.classList.add('shown')
        }
    }
}

function hideHints(board, i, j) {
    var rowIdx = i
    var colIdx = j

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            // update the DOM
            var selector = `[data-i="${i}"][data-j="${j}"]`
            var elneg = document.querySelector(selector)
            console.log(elneg)
            if (board[i][j].isShown || board[i][j].isMarked) continue
            else {
                elneg.innerText = ''
                elneg.classList.remove('shown')
            }
        }
    }
}

function hintActive(i, j) {
    //update the model
    gGame.isHint = true
    gGame.hintsCount--

    // update the DOM
    document.querySelector('.hints').innerText = 'Hints: '
    for (var i = 0; i < gGame.hintsCount; i++) {
        document.querySelector('.hints').innerText += `${HINT}`
    }
}

function setHighscore() {
    // store cuurent round's timing in gGame.secsPassed
    gGame.secsPassed = document.querySelector('.timer span').innerText

    if (gLevel.SIZE === 4) {
        document.querySelector('.highscore span').innerText = `${gHighscoreLvl1} 🏆`

        if (+gGame.secsPassed < +gHighscoreLvl1) {
            // update the model
            localStorage.setItem('highscoreLvl1', `${gGame.secsPassed}`)
            gHighscoreLvl1 = localStorage.getItem('highscoreLvl1')

            //update the DOM
            document.querySelector('.highscore span').innerText = `${gHighscoreLvl1} 🏆`
        }
    }
    else if (gLevel.SIZE === 8) {
        document.querySelector('.highscore span').innerText = `${gHighscoreLvl2} 🏆`

        if (+gGame.secsPassed < +gHighscoreLvl2) {
            // update the model
            localStorage.setItem('highscoreLvl2', `${gGame.secsPassed}`)
            gHighscoreLvl2 = localStorage.getItem('highscoreLvl2')

            //update the DOM
            document.querySelector('.highscore span').innerText = `${gHighscoreLvl2} 🏆`
        }
    }

    else if (gLevel.SIZE === 12) {
        document.querySelector('.highscore span').innerText = `${gHighscoreLvl3} 🏆`

        if (+gGame.secsPassed < +gHighscoreLvl3) {
            // update the model
            localStorage.setItem('highscoreLvl3', `${gGame.secsPassed}`)
            gHighscoreLvl3 = localStorage.getItem('highscoreLvl3')

            //update the DOM
            document.querySelector('.highscore span').innerText = `${gHighscoreLvl3} 🏆`
        }
    }
}

// sure there's a more efficient way
// function setHighscore() {
//     // store cuurent round's timing in gGame.secsPassed
//     gGame.secsPassed = document.querySelector('.timer span').innerText

//     if (gLevel.SIZE === 4) {
//         highscoreByLevel(1)
//     }
//     else if (gLevel.SIZE === 8) {
//         highscoreByLevel(2)
//     }

//     else if (gLevel.SIZE === 12) {
//         highscoreByLevel(3)

//     }
// }

// function highscoreByLevel(level){
//     var currLvlHighscore = 'gHighscoreLvl' + level
//     console.log(currLvlHighscore)
//     document.querySelector('.highscore span').innerText = `${currLvlHighscore} 🏆`

//     if (+gGame.secsPassed < +currLvlHighscore) {
//         // update the model
//         localStorage.setItem(`${currLvlHighscore}`, `${gGame.secsPassed}`)
//         currLvlHighscore = localStorage.getItem(`${currLvlHighscore}`)

//         //update the DOM
//         document.querySelector('.highscore span').innerText = `${currLvlHighscore} 🏆`
//     }
// }

function safeClick(board) {
    if (gGame.safeClicksCount !== 0) {
        //update the model
        var isSafeActive = false
        gGame.safeClicksCount--

        // update the DOM
        document.querySelector('.safe-clicks-count span').innerText = gGame.safeClicksCount
        while (isSafeActive === false) {
            var rndJ = getRandomIntInclusive(0, gLevel.SIZE - 1)
            var rndI = getRandomIntInclusive(0, gLevel.SIZE - 1)

            if (board[rndI][rndJ].isMine === false &&
                board[rndI][rndJ].isShown === false &&
                board[rndI][rndJ].isMarked === false) {

                var selector = `[data-i="${rndI}"][data-j="${rndJ}"]`
                var safeCell = document.querySelector(selector)
                console.log(safeCell)
                safeCell.classList.add('safe')

                isSafeActive = true
            }
        }
        setTimeout(() => {
            safeCell.classList.remove('safe')
            document.querySelector('.safe-click-btn').classList.add('unavailable')
        }, 2000)

    }
}

function toggleDisplayMode(){
    document.querySelector('body').classList.toggle('dark-mode')
    document.querySelector('.highscore').classList.toggle('highscore-dark-mode')
    document.querySelector('.top-container').classList.toggle('top-container-dark-mode')
}