// kernel mock (legacy from cstimer)
const kernel = {
  props: {
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
      return (
        '#' +
        (longFormat
          ? col[0] + col[0] + col[1] + col[1] + col[2] + col[2]
          : col[0] + col[1] + col[2])
      )
    },
  },

  parseScramble(scramble, moveMap, addPreScr) {
    const scrambleReg =
      /^([\d]+(?:-\d+)?)?([FRUBLDfrubldzxySME])(?:([w])|&sup([\d]);)?([2'])?$/
    scramble = scramble || ''
    if (addPreScr) {
      scramble =
        getProp(tools.isCurTrainScramble() ? 'preScrT' : 'preScr') +
        ' ' +
        scramble
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

export default kernel
