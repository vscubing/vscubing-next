// NOTE: taken from https://github.com/cs0x7f/cstimer/blob/0c649629be49b99804e2a3ce114502a576543ed9/src/js/lib/puzzlefactory.js

import twistyjs from './twisty/twisty'
import './twisty/twistynnn'
import $ from 'jquery'
import kernel from './kernel'

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
  applyPattern(pattern) {
    return this.twistyScene.applyPattern(pattern)
  }
}

var prevParents = []

export async function init(options, moveListener, parentNativeElem) {
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
  }

  const twistyInternalOptions = {
    type: 'cube',
    colorscheme: options.colorscheme,
    dimension: options.dimension,
    stickerWidth: 1.7,
    scale: 0.9,
  }

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

  child[2].twistyScene.initializeTwisty(twistyInternalOptions)
  child[2].twisty = child[2].twistyScene.getTwisty()
  child[2].resize()
  window.t = child[2]

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
