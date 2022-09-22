'use strict'
const MINE = '💣'
const FLAG = '🚩'


var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
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
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'

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
    if (gBoard[i][j].isMine === false) {
        // TODO: switch cases?
        if (gBoard[i][j].minesAroundCount !== 0) {
            // Update the model
            gBoard[i][j].isShown = true
            gGame.shownCount++

            // Update the DOM
            elCell.innerText = `${gBoard[i][j].minesAroundCount}`
        } else {
            // Update the model
            gBoard[i][j].isShown = true
            gGame.shownCount++

            var negs = revealNegs(gBoard, i, j)
            // Update the DOM

        }
        // Update the DOM
        if (gBoard[i][j].isShown) elCell.classList.add('shown')
    }

    else {
        elCell.innerText = `${MINE}`
        // gameOver()
    }
}

function cellMarked(elCell, i, j) {
    // Update the model
    gBoard[i][j].isMarked = true
    gGame.markedCount++
  
    // Update the DOM
    console.log('i', i, 'j', j)
    window.addEventListener('contextmenu', function (e) {
        elCell.innerText = `${FLAG}`
        e.preventDefault();
    }, false)
}