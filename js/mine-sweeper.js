'use strict'

const MINE = '💥'
const FLAG = '🚩'
const LIFE = '💗'
const HINT = '💡'

var gBoard
var gSmily
var gtimerInterval

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
    hintsCount: 3
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
                if(!gGame.isHint){
                    //update the model
                    gGame.lives--
                    elCell.isMarked = true
                    console.log('elCell.isMarked', elCell.isMarked)
                    gGame.markedCount++
    
                    // // Update the DOM
                    elCell.innerText = MINE
                    var elMsg = document.querySelector('.msg')
                    elMsg.classList.add('red-bg')
                    elMsg.innerText = `You stepped on a mine! be careful \n You have ${gGame.lives} lives`
                    
                    setTimeout(() => {
                        elMsg.innerText = ''
                        elMsg.classList.remove('red-bg')
    
                    }, 2000)
    
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
            if(gBoard[i][j].isMine){
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
            var negs = []

            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            // update the DOM
            var selector = `[data-i="${i}"][data-j="${j}"]`
            var elneg = document.querySelector(selector)

            if (gBoard[i][j].minesAroundCount !== 0) {
                elneg.innerText = `${gBoard[i][j].minesAroundCount}`
            } else elneg.innerText = ''

            if(gBoard[i][j].isMine){
                elneg.innerText = `${MINE}`
            }
            if (gBoard[i][j].isShown) {
                elneg.classList.add('shown')
            }
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
            
            if(!board[i][j].isShown || !board[i][j].isMarked){
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


// fix: when hint is hidden it also hides the mines that were revealed before
