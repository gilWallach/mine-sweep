'use strict'
const MINE = '💥'
const FLAG = '🚩'

var gSmily
var gtimerInterval

var gLevel = {
    SIZE: 4,
    MINES: 2
}
console.log(gLevel)


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    gameLost: false
}

var gBoard

function init() {
    gSmily = '🙂'
    gBoard = createBoard(gLevel.SIZE)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}

function createBoard(size) {
    var mat = []

    for (var i = 0; i < size; i++) {
        mat[i] = []
        for (var j = 0; j < size; j++) {
            var isMine = false
            mat[i].push(createCell(isMine))

            if ((i === 3 && j === 2) || (i === 1 && j === 0)) {
                isMine = true
                mat[i][j] = createCell(isMine)
            }

            // TODO: fix rndIdx for mine cells + adapt for levels
            // for(var k = 0; k <gLevel.MINES; k++){
            //     var rndI = getRandomIntInclusive(0, size - 1)
            //     var rndJ = getRandomIntInclusive(0, size - 1)
            //     if(i === rndI && j === rndJ){
            //         isMine = true
            //         mat[i][j] = createCell(isMine)
            //     }
            // }

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
    // start timer
    if (!gGame.isOn) {
        gGame.isOn = true
        showTimer()
    }
    // if cell is already clicked
    if (gBoard[i][j].isShown) {
        gBoard[i][j].isShown = false
        gGame.shownCount--
    }
    // if cell isn't clicked yet
    else {
        // TODO: switch cases maybe more clear
        if (!gBoard[i][j].isMine) {
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
                expandShown(gBoard, i, j)
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

        gGame.isOn = false
        clearInterval(gtimerInterval)
        
        // Update the DOM
        msg = 'You Win!'
        gSmily = '😎'
        elMsg.innerText = msg
        document.querySelector('.smily').innerText = gSmily
        // elMsg.classList.add('msg-shown')
    }
    // Lose
    else if (gGame.gameLost) {
        // Update the model
        gGame.isOn = false
        clearInterval(gtimerInterval)
        
        // Update the DOM
        msg = 'You Lose...'
        gSmily = '🤯'
        elMsg.innerText = msg
        
        document.querySelector('.smily').innerText = gSmily
        // elMsg.classList.add('msg-shown')
    }
}

function restartGame() {
    clearInterval(gtimerInterval)
    resetgGame()
    init()

    document.querySelector('.msg').innerText = ''
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
            ms = ms.substring(ms.length - 3, ms.length)

            timer.innerText = `\n ${secs}:${ms}`
        }, 100)
    }
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
            if (gBoard[i][j].isShown) {
                elneg.classList.add('shown')
            }
        }
    }
}