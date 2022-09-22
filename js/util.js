'use strict'
function createCell(isMine) {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: isMine,
        isMarked: false
    }
}

function countMinesAround(board, rowIdx, colIdx) {
    var minesCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = board[i][j]
            // console.log('currCell: ', currCell)
            if (currCell.isMine === true) minesCount++
        }
    }
    return minesCount
}

function revealNegs(board, rowIdx, colIdx) {
    var negs = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            // update the model
            if (gBoard[i][j].isShown === false) {
                gBoard[i][j].isShown = true
                negs.push(board[i][j])
            }
            // update the DOM
            var selector = `[data-i="${i}"][data-j="${j}"]`
            var elCell = document.querySelector(selector)

            if (gBoard[i][j].minesAroundCount !== 0) {
                elCell.innerText = `${gBoard[i][j].minesAroundCount}`
            }
            if (gBoard[i][j].isShown) {
                elCell.classList.add('shown')
            }
        }
    }
    gGame.shownCount += negs.length
}

function resetgGame() {
    return gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
}