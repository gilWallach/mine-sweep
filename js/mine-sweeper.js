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

// setMinesNegsCount(gBoard)
// console.log(gBoard)

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
            strHTML += `\t<td class="cell" onClick="cellClicked(this, ${i}, ${j})" ${dataAttribStr}></td>\n`
        }
        strHTML += '\n</tr>\n'
    }

    var elBoard = document.querySelector('table tbody')
    elBoard.innerHTML = strHTML
}

function cellClicked(elCell, i, j) {
    if (gBoard[i][j].isMine === false) {

        if (gBoard[i][j].minesAroundCount !== 0) {
            // Update the model
            gBoard[i][j].isShown = true

            // Update the DOM
            elCell.innerText = `${gBoard[i][j].minesAroundCount}`
        } else {
            // Update the model
            gBoard[i][j].isShown = true

            var negs = findNegs(gBoard, i, j)
            for (var k = 0; k < negs.length; k++) {
                // Update the model
                negs[k].isShown = true
            }
                // Update the DOM
                
        }
        if (gBoard[i][j].isShown) elCell.classList.add('shown')
    }
}
