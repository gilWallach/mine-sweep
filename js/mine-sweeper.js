'use strict'
const MINE = '💣'
const FLAG = '🚩'

var gSmily = '🙂'
var gTimer = document.querySelector('.timer span')
var gtimerInterval


var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    gameLost: false
}

var gBoard = createBoard(gLevel.SIZE)

function init() {
    resetgGame()
    createBoard(gLevel.SIZE)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)

}

// console.log(gBoard)

function createBoard(size) {
    var mat = []
    // TODO: get rndIdx for mine cells
    for (var i = 0; i < size; i++) {
        mat[i] = []
        for (var j = 0; j < size; j++) {

            if ((i === 2 && j === 3) || (i === 3 && j === 1)) {
                isMine = true
                mat[i].push(createCell(isMine))
            } else {
                var isMine = false
                mat[i].push(createCell(isMine))
            }

        }
    }
    return mat
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var minesAroundCount = countMinesAround(board, i, j)
            // console.log('minesAroundCount', minesAroundCount)

            var currCell = board[i][j]

            if (minesAroundCount !== 0) currCell.minesAroundCount += minesAroundCount
        }
    }
}

function renderBoard(board) {
    document.querySelector('.smily').innerText = gSmily
    var strHTML = ``

    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`

        for (var j = 0; j < board[0].length; j++) {
            var dataAttribStr = `data-i="${i}" data-j="${j}"`
            strHTML += `\t<td class="cell" onClick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})" ${dataAttribStr}></td>\n`
        }
        strHTML += '\n</tr>\n'
    }

    var elBoard = document.querySelector('table tbody')
    elBoard.innerHTML = strHTML
}


function cellClicked(elCell, i, j) {
    gGame.isOn = true
    
    if (gBoard[i][j].isShown) {
        gBoard[i][j].isShown = false
        gGame.shownCount--

        elCell.innerText = ``
        elCell.classList.remove('shown')
    }
    else { 
        if (gBoard[i][j].isMine === false) {
            // TODO: switch cases?
            if (gBoard[i][j].minesAroundCount !== 0) {
                // Update the model
                gBoard[i][j].isShown = true
                gGame.shownCount++
    
                checkGameOver()
    
                // Update the DOM
                elCell.innerText = `${gBoard[i][j].minesAroundCount}`
            } else {
                // Update the model
                gBoard[i][j].isShown = true
                gGame.shownCount++
                revealNegs(gBoard, i, j)
                checkGameOver()
    
            }
            // Update the DOM
            elCell.classList.add('shown')
        }
    
        else {
            // Update the model
            gGame.gameLost = true
            checkGameOver()
    
            // Update the DOM
    
            elCell.innerText = `${MINE}`
        }

     }
}


function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isMarked === false) {
        // Update the model
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        checkGameOver()

        // Update the DOM
        window.addEventListener('contextmenu', function (e) {
            elCell.innerText = `${FLAG}`
            e.preventDefault();
        }, false)
    } else {
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
    console.log('gGame.markedCount', gGame.markedCount)
    console.log('gGame.shownCount', gGame.shownCount)
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === gLevel.SIZE ** 2 - gGame.markedCount) {
        msg = 'You Win!'
        gSmily = '😎'
        elMsg.innerText = msg
        document.querySelector('.smily').innerText = gSmily
    }
    else if (gGame.gameLost === true) {
        // Update the model
        gGame.isOn = false
        msg = 'You Lose'
        gSmily = '🤯'
        elMsg.innerText = msg
        document.querySelector('.smily').innerText = gSmily
    }
}

function showTimer() {
    if (gGame.isOn) {
        var timer = document.querySelector('.timer span')
        var start = Date.now()

        gtimerInterval = setInterval(function () {
            var currTs = Date.now()

            var secs = parseInt((currTs - start) / 1000)
            var ms = (currTs - start) - secs * 1000
            ms = '000' + ms
            // 00034 // 0001
            ms = ms.substring(ms.length - 3, ms.length)

            timer.innerText = `\n ${secs}:${ms}`
        }, 100)

    }

}