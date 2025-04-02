/* eslint-disable */

// NOTE: taken from https://github.com/cs0x7f/cstimer/blob/0c649629be49b99804e2a3ce114502a576543ed9/src/js/lib/puzzlefactory.js

import './twisty/twisty'
import './twisty/twistynnn'

var twistyScene

class Puzzle {
  constructor(twistyScene, twisty) {
    this.twistyScene = twistyScene
    this.twisty = twisty
  }
  keydown(args) {
    if (args.keyCode === 59) {
      // Firefox and Chrome have different keyCodes for ";", see https://stackoverflow.com/a/38844570
      args = { ...args, keyCode: 186 }
    }
    return this.twistyScene.keydown(args)
  }
  resize() {
    return this.twistyScene.resize()
  }
  addMoves(args) {
    return this.twistyScene.addMoves(args)
  }
  applyMoves(...args) {
    return this.twistyScene.applyMoves(...args)
  }
  setCameraPosition(...args) {
    return this.twistyScene.setCameraPosition(...args)
  }
  addMoveListener(listener) {
    return this.twistyScene.addMoveListener(listener)
  }
  addCameraPositionListener(listener) {
    return this.twistyScene.addCameraPositionListener(listener)
  }
  getDomElement() {
    return this.twistyScene.getDomElement()
  }
  isRotation(move) {
    return this.twisty.isInspectionLegalMove(this.twisty, move)
  }
  move2str(move) {
    return this.twisty.move2str(move)
  }
  moveInv(move) {
    return this.twisty.moveInv(move)
  }
  toggleColorVisible(args) {
    return this.twisty.toggleColorVisible(this.twisty, args)
  }
  isSolved(args) {
    return this.twisty.isSolved(this.twisty, args)
  }
  moveCnt(clr) {
    return this.twisty.moveCnt(clr)
  }
  parseScramble(scramble, addPreScr) {
    return this.twisty.parseScramble(scramble, addPreScr)
  }
}

var prevParents = []

export async function init(options, moveListener, cameraPositionListener, parentNativeElem) {
  kernel.props.vrcSpeed = options.animationDuration
  var parent = $(parentNativeElem)
  // if (window.twistyjs == undefined) {
  //   toInitCalls = init.bind(null, options, moveListener, parent, callback)
  //   if (!isLoading && document.createElement('canvas').getContext) {
  //     isLoading = true
  //     $.getScript('js/twisty.js', function () {
  //       toInitCalls && toInitCalls()
  //     })
  //   } else {
  //     callback(undefined, true)
  //   }
  //   return
  // }
  // var style = /^q[2l]?$/.exec(options['style']) ? 'q' : 'v'
  var style = 'v'

  var child = null
  for (var i = 0; i < prevParents.length; i++) {
    if (prevParents[i][0] == parent) {
      child = prevParents[i]
      break
    }
  }
  var isInit = !child || child[1] != style
  if (isInit) {
    if (!child) {
      child = [parent, style]
      prevParents.push(child)
    } else {
      child[1] = style
    }
    if (style == 'q') {
      twistyScene = new twistyjs.qcube.TwistyScene()
    } else {
      twistyScene = new twistyjs.TwistyScene()
    }
    child[2] = new Puzzle(twistyScene, null)
    parent.empty().append(child[2].getDomElement())
    child[2].addMoveListener(moveListener)
    child[2].addCameraPositionListener(cameraPositionListener)
  }
  var puzzle = options['puzzle']
  // if (puzzle.startsWith('cube')) {
  options['type'] = 'cube'
  options['faceColors'] = col2std(kernel.getProp('colcube'), [3, 4, 5, 0, 1, 2]) // U L F D L B
  options['dimension'] = ~~puzzle.slice(4) || 3
  options['stickerWidth'] = 1.7
  // } else if (puzzle == 'skb') {
  //   options['type'] = 'skewb'
  //   options['faceColors'] = col2std(kernel.getProp('colskb'), [0, 5, 4, 2, 1, 3])
  // } else if (puzzle == 'mgm') {
  //   options['type'] = 'mgm'
  //   options['faceColors'] = col2std(kernel.getProp('colmgm'), [0, 2, 1, 5, 4, 3, 11, 9, 8, 7, 6, 10])
  // } else if (puzzle == 'pyr') {
  //   options['type'] = 'pyr'
  //   options['faceColors'] = col2std(kernel.getProp('colpyr'), [3, 1, 2, 0])
  // } else if (puzzle == 'sq1') {
  //   options['type'] = 'sq1'
  //   options['faceColors'] = col2std(kernel.getProp('colsq1'), [0, 5, 4, 2, 1, 3])
  // } else if (puzzle == 'clk') {
  //   options['type'] = 'clk'
  //   options['faceColors'] = col2std(kernel.getProp('colclk'), [1, 2, 0, 3, 4])
  // }
  options['scale'] = 0.9
  child[2].twistyScene.initializeTwisty(options)
  child[2].twisty = child[2].twistyScene.getTwisty()
  child[2].resize()

  return child[2]
}

function col2std(col, faceMap) {
  var ret = []
  col = (col || '').match(/#[0-9a-fA-F]{3}/g) || []
  for (var i = 0; i < col.length; i++) {
    ret.push(~~kernel.ui.nearColor(col[faceMap[i]], 0, true).replace('#', '0x'))
  }
  return ret
}

// kernel mock
const kernel = {
  props: {
    colcube: '#ff0#fa0#00f#fff#f00#0d0',
    vrcSpeed: 100,
    vrcAH: '01',
    vrcMP: 'n',
  },
  getProp(prop) {
    return kernel.props[prop]
  },
  ui: {
    nearColor(color, ref, longFormat) {
      var col, m
      ref = ref || 0
      m = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/.exec(color)
      if (m) {
        col = [m[1] + m[1], m[2] + m[2], m[3] + m[3]]
      }
      m = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(color)
      if (m) {
        col = [m[1], m[2], m[3]]
      }
      for (var i = 0; i < 3; i++) {
        col[i] = parseInt(col[i], 16)
        col[i] += ref
        col[i] = Math.min(Math.max(col[i], 0), 255)
        col[i] = Math.round(col[i] / 17).toString(16)
      }
      return '#' + (longFormat ? col[0] + col[0] + col[1] + col[1] + col[2] + col[2] : col[0] + col[1] + col[2])
    },
  },

  parseScramble(scramble, moveMap, addPreScr) {
    const scrambleReg = /^([\d]+(?:-\d+)?)?([FRUBLDfrubldzxySME])(?:([w])|&sup([\d]);)?([2'])?$/
    scramble = scramble || ''
    if (addPreScr) {
      scramble = getProp(tools.isCurTrainScramble() ? 'preScrT' : 'preScr') + ' ' + scramble
    }
    var moveseq = []
    var moves = scramble.split(' ')
    var m, w, f, p
    for (var s = 0; s < moves.length; s++) {
      m = scrambleReg.exec(moves[s])
      if (m == null) {
        continue
      }
      f = 'FRUBLDfrubldzxySME'.indexOf(m[2])
      if (f > 14) {
        p = "2'".indexOf(m[5] || 'X') + 2
        f = [0, 4, 5][f % 3]
        moveseq.push([moveMap.indexOf('FRUBLD'.charAt(f)), 2, p])
        moveseq.push([moveMap.indexOf('FRUBLD'.charAt(f)), 1, 4 - p])
        continue
      }
      w = (m[1] || '').split('-')
      var w2 = ~~w[1] || -1
      w = f < 12 ? ~~w[0] || ~~m[4] || ((m[3] == 'w' || f > 5) && 2) || 1 : -1
      p = (f < 12 ? 1 : -1) * ("2'".indexOf(m[5] || 'X') + 2)
      moveseq.push([moveMap.indexOf('FRUBLD'.charAt(f % 6)), w, p, w2])
    }
    return moveseq
  },
}
window.kernel = kernel

window.requestAnimFrame = window.requestAnimationFrame
window.cancelRequestAnimFrame = window.cancelAnimationFrame
