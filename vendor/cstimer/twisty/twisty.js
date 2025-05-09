'use strict'

// NOTE: taken from https://github.com/cs0x7f/cstimer/blob/0c649629be49b99804e2a3ce114502a576543ed9/src/js/twisty/twisty.js

import $ from 'jquery'
import THREE from '../threemin'
import kernel from '../kernel'

const touchGridStyles = `
body {
  overscroll-behavior: none;
}
.touchcube {
  position: absolute;
  inset: 0;
  text-align: center;
  user-select: none;
}
.touchcube tr td {
  width: 33%;
  height: 33%;
}
.touchcube.active {
  background-color: #6666;
  color: #fffa;
}
.touchcube.active td.touchto {
  background-color: #0f0a;
}
.touchcube.active td.touchfrom {
  background-color: #f00a;
}
.touchcube.board td {
  border: 2px solid #6666;
  border: 0.15rem solid #6666;
}
`

/*
 * twisty.js
 *
 * Started by Lucas Garron, July 22, 2011 at WSOH
 * Made classy by Jeremy Fleischman, October 7, 2011 during the flight to worlds
 *
 */

THREE.Ploy = function (points) {
  THREE.Geometry.call(this)
  for (var i = 0; i < points.length; i++) {
    this.vertices.push(
      new THREE.Vertex(new THREE.Vector3(points[i][0], points[i][1], 0)),
    )
  }

  if (points.length == 4) {
    this.faces.push(new THREE.Face4(0, 1, 2, 3))
  } else {
    this.faces.push(new THREE.Face3(0, 1, 2))
  }

  this.computeCentroids()
  this.computeFaceNormals()
}
THREE.Ploy.prototype = new THREE.Geometry()
THREE.Ploy.prototype.constructor = THREE.Ploy

const twistyjs = (function () {
  /****************
   *
   * Twisty Plugins
   *
   * Plugins register themselves by calling twistyjs.registerTwisty.
   * This lets plugins be defined in different files.
   *
   */

  var twistyjs = {}

  var twisties = {}
  twistyjs.registerTwisty = function (twistyName, twistyConstructor) {
    //	assert(!(twistyName in twisties));
    twisties[twistyName] = twistyConstructor
  }

  twistyjs.TwistyScene = function () {
    // that=this is a Crockford convention for accessing "this" inside of methods.
    var that = this

    var twisty = null

    var moveProgress = null
    var currentMove = null
    var moveQueue = []

    var camera, scene, renderer
    var twistyCanvas
    var touchCube

    // these must be initialized by calling `this.setCameraPosition` externally
    var cameraTheta
    var cameraPhi
    var cameraInitialized = false

    /*
     * Initialization Methods
     */
    var twistyContainer = $('<div/>')
    twistyContainer.css('width', '100%')
    twistyContainer.css('height', '100%')
    twistyContainer.css('position', 'relative')
    twistyContainer = twistyContainer[0]

    this.getDomElement = function () {
      return twistyContainer
    }
    this.getCanvas = function () {
      return twistyCanvas
    }
    this.getTwisty = function () {
      return twisty
    }

    this.initializeTwisty = function (twistyType) {
      moveQueue = []
      currentMove = []
      moveProgress = []
      // We may have an animation queued up that is tied to the twistyCanvas.
      // Since we're about to destroy our twistyCanvas, that animation request
      // will never fire. Thus, we must explicitly stop animating here.
      stopAnimation()

      $(twistyContainer).empty()
      //		log("Canvas Size: " + $(twistyContainer).width() + " x " + $(twistyContainer).height());

      /*
       * Scene Setup
       */

      scene = new THREE.Scene()

      /*
       * 3D Object Creation
       */

      twisty = createTwisty(twistyType)
      scene.addObject(twisty._3d)

      /*
       * Go!
       */

      renderer = new THREE.CanvasRenderer()
      twistyCanvas = renderer.domElement

      twistyContainer.appendChild(twistyCanvas)
      touchCube = $('<table class="touchcube">')
      var trs = ''
      for (var i = 0; i < 3; i++) {
        var tds = ''
        for (var j = 0; j < 3; j++) {
          tds += '<td data="' + (i * 3 + j + 1) + '"/>'
        }
        trs += '<tr>' + tds + '</tr>'
      }
      touchCube.append(trs)

      if (twistyType.allowDragging) {
        const css = document.createElement('style')
        css.innerHTML = touchGridStyles
        twistyContainer.append(css)
        touchCube.appendTo(twistyContainer)
        touchCube.on('mousedown', onTouchDown)
        touchCube.on('mousemove', onTouchMove)
        touchCube.on('mouseup', onTouchUp)
        touchCube.on('touchstart', onTouchDown)
        touchCube.on('touchmove', onTouchMove)
        touchCube.on('touchend', onTouchUp)
        /*
				twistyCanvas.addEventListener('mousedown', onCanvasDown);
				twistyCanvas.addEventListener('mousemove', onCanvasMove);
				twistyCanvas.addEventListener('mouseup', onCanvasUp);
				twistyCanvas.addEventListener('touchstart', onCanvasDown);
				twistyCanvas.addEventListener('touchmove', onCanvasMove);
				twistyCanvas.addEventListener('touchend', onCanvasUp);
				*/
      }
      // resize creates the camera and calls render()
      that.resize()
    }

    this.resize = function () {
      // This function should be called after setting twistyContainer
      // to the desired size.
      var min = Math.min(
        $(twistyContainer).width(),
        $(twistyContainer).height(),
      )
      renderer.setSize(min, min)
      touchCube.css({
        width: min,
        height: min,
        'font-size': min * 0.15,
      })
    }

    this.keydown = function (e) {
      var keyCode = e.keyCode
      var ret = twisty.keydownCallback(twisty, e)

      switch (keyCode) {
        case 37:
          moveCameraDelta(1, 0)
          e.preventDefault && e.preventDefault()
          break
        case 38:
          moveCameraDelta(0, 1)
          e.preventDefault && e.preventDefault()
          break
        case 39:
          moveCameraDelta(-1, 0)
          e.preventDefault && e.preventDefault()
          break
        case 40:
          moveCameraDelta(0, -1)
          e.preventDefault && e.preventDefault()
          break
        default:
          ret && render()
      }
    }

    var startIdx = null

    function getTouchIdx(event) {
      var obj = event.target
      if (event.type.startsWith('touch')) {
        obj = document.elementFromPoint(
          event.originalEvent.changedTouches[0].pageX,
          event.originalEvent.changedTouches[0].pageY,
        )
      }
      return ~~$(obj).attr('data')
    }

    function hintBoard() {
      touchCube.addClass('board')
      setTimeout(function () {
        touchCube && touchCube.removeClass('board')
      }, 5000)
    }

    function onTouchDown(event) {
      startIdx = getTouchIdx(event)
      if (!startIdx) {
        return
      }
      touchCube.addClass('active')
      hintBoard()
      var validMoves = twisty.getTouchMoves()
      for (var i = 1; i <= 9; i++) {
        var key = startIdx * 10 + i
        var obj = touchCube.find('[data="' + i + '"]')
        if (key in validMoves) {
          obj.html(validMoves[key][0])
        } else {
          obj.html('')
        }
      }
      touchCube.find('td').removeClass('touchfrom touchto')
      touchCube.find('[data="' + startIdx + '"]').addClass('touchfrom')
    }

    function onTouchMove(event) {
      if (!startIdx) {
        return
      }
      var curIdx = getTouchIdx(event)
      if (!curIdx) {
        touchCube.removeClass('active')
        return
      }
      touchCube.addClass('active')
      hintBoard()
      var validMoves = twisty.getTouchMoves()
      var key = startIdx * 10 + curIdx
      touchCube.find('td').removeClass('touchfrom touchto')
      touchCube
        .find('[data="' + curIdx + '"]')
        .addClass(key in validMoves ? 'touchto' : 'touchfrom')
      touchCube.find('[data="' + startIdx + '"]').addClass('touchfrom')
    }

    function onTouchUp(event) {
      touchCube.removeClass('active')
      if (!startIdx) {
        return
      }
      var curIdx = getTouchIdx(event)
      if (!curIdx) {
        return
      }
      touchCube.find('td').removeClass('touchfrom touchto').html('')
      var validMoves = twisty.getTouchMoves()
      var key = startIdx * 10 + curIdx
      startIdx = null
      if (!(key in validMoves)) {
        return
      }
      that.addMoves([validMoves[key][1]])
    }

    /**
		var clkPoint = null;

		function onCanvasDown(event) {
			if (!twisty.getRaycastMoves || !that.isMoveFinished()) {
				return;
			}
			fixTouchOffsets(event);
			var intObjs = getRaycastObjects(event, twistyCanvas);
			if (intObjs.length == 0) {
				return;
			}
			var moves = twisty.getRaycastMoves(twisty, intObjs);
			if (moves.length == 0) {
				return;
			}
			clkPoint = [event.offsetX, event.offsetY, moves];
			var projMatrix4 = new THREE.Matrix4().multiply(camera.projectionMatrix, camera.matrixWorldInverse);
			for (var i = 0; i < moves.length; i++) {
				var targetPoint = new THREE.Vector3().add(intObjs[0].point, moves[i][2]);
				projMatrix4.multiplyVector3(targetPoint);
				var x = (targetPoint.x + 1) / 2 * twistyCanvas.width;
				var y = -(targetPoint.y - 1) / 2 * twistyCanvas.height;
				var dx = x - event.offsetX;
				var dy = y - event.offsetY;
				var norm = Math.sqrt(dx * dx + dy * dy);
				moves[i][2] = [dx / norm, dy / norm];
			}
			return;
		}

		function fixTouchOffsets(event) {
			if (event.type.startsWith('touch')) {
				var rect = event.target.getBoundingClientRect();
				event.offsetX = (event.changedTouches[0].clientX - window.pageXOffset - rect.left);
				event.offsetY = (event.changedTouches[0].clientY - window.pageYOffset - rect.top);
			}
		}

		function onCanvasMove(event) {
			if (!clkPoint) {
				return;
			}
			fixTouchOffsets(event);
			var dx = event.offsetX - clkPoint[0];
			var dy = event.offsetY - clkPoint[1];
			if (Math.sqrt(dx * dx + dy * dy) < twistyCanvas.width * 0.05) {
				return;
			}
			triggerMove(dx, dy, clkPoint[2]);
		}

		function onCanvasUp(event) {
			if (!clkPoint) {
				return;
			}
			fixTouchOffsets(event);
			var dx = event.offsetX - clkPoint[0];
			var dy = event.offsetY - clkPoint[1];
			clkPoint = null;
			if (Math.sqrt(dx * dx + dy * dy) < twistyCanvas.width * 0.05) {
				return;
			}
			triggerMove(dx, dy);
		}

		function triggerMove(dx, dy) {
			var chk = [];
			var curMoves = clkPoint[2];
			for (var i = 0; i < curMoves.length; i++) {
				var moveXY = curMoves[i][2];
				var val = dx * moveXY[0] + dy * moveXY[1];
				var move = curMoves[i][0].slice();
				if (val < 0) {
					move[3] *= -1;
					val *= -1;
				}
				chk.push([val, move]);
			}
			chk.sort(function(a, b) {
				return b[0] - a[0];
			});
			that.addMoves([chk[0][1]]);
			clkPoint = null;
		}

		function getRaycastObjects(event, canvas) {
			var x = (event.offsetX / canvas.width) * 2 - 1;
			var y = -(event.offsetY / canvas.height) * 2 + 1;
			var origin = camera.position;
			var direction = new THREE.Vector3(x, y, 0);
			THREE.Matrix4.makeInvert(camera.projectionMatrix).multiplyVector3(direction);
			camera.matrixWorld.multiplyVector3(direction);
			direction.subSelf(origin).normalize();
			return new THREE.Ray(origin, direction).intersectScene(scene);
		}
		*/

    this.cam = function (deltaTheta) {
      moveCameraDelta(deltaTheta, 0)
    }

    function render() {
      if (camera) {
        renderer.render(scene, camera)
      }
    }

    var cameraPositionListeners = []
    this.addCameraPositionListener = function (listener) {
      cameraPositionListeners.push(listener)
    }
    this.removeCameraPositionListener = function (listener) {
      var index = cameraPositionListeners.indexOf(listener)
      delete cameraPositionListeners[index]
    }
    function fireCameraPositionChanged(theta, phi) {
      for (var i = 0; i < cameraPositionListeners.length; i++) {
        cameraPositionListeners[i]({ theta, phi })
      }
    }
    this.setCameraPosition = function ({ theta, phi }) {
      if (!camera) {
        camera = new THREE.Camera(30, 1, 0, 1000)
        camera.target.position = new THREE.Vector3(0, -0.075, 0)
      }
      if (cameraTheta === theta && cameraPhi === phi) {
        render()
      }
      moveCamera(theta, phi, true)
    }

    function moveCameraDelta(deltaTheta, deltaPhi) {
      cameraTheta += deltaTheta
      cameraTheta = Math.max(Math.min(cameraTheta, 6), -6)
      cameraPhi += deltaPhi
      cameraPhi = Math.max(Math.min(cameraPhi, 6), -6)
      moveCamera(cameraTheta, cameraPhi, true)
    }

    function moveCamera(theta, phi, doRender) {
      cameraTheta = theta
      cameraPhi = phi
      var z = 2 * Math.sqrt(2) * Math.sin((phi * Math.TAU) / 48)
      var xy = 2 * Math.sqrt(2) * Math.cos((phi * Math.TAU) / 48)
      camera.position = new THREE.Vector3(
        xy * Math.sin((theta * Math.TAU) / 48),
        z,
        xy * Math.cos((theta * Math.TAU) / 48),
      )
      if (doRender) {
        render()
      }
      fireCameraPositionChanged(theta, phi)
    }

    //callback(move, step), step: 0 move added, 1 move animation started, 2 move animation finished
    var moveListeners = []
    this.addMoveListener = function (listener) {
      moveListeners.push(listener)
    }
    this.removeMoveListener = function (listener) {
      var index = moveListeners.indexOf(listener)
      delete moveListeners[index]
    }

    function fireMoveEnded(movets) {
      for (var i = 0; i < moveListeners.length; i++) {
        moveListeners[i](movets[0], movets[1])
      }
    }

    function startMove() {
      currentMove.push(moveQueue.shift())
      moveProgress.push(0)
    }

    this.addMoves = function (moves, ts) {
      var timestamp = ts || $.now()
      var movets = []
      for (var i = 0; i < moves.length; i++) {
        movets.push([moves[i], timestamp])
      }
      if (~~kernel.getProp('vrcSpeed', 100) == 0) {
        return this.applyMoves(moves, ts)
      }
      moveQueue = moveQueue.concat(movets)
      if (moveQueue.length > 0) {
        startAnimation()
      }
    }

    this.isMoveFinished = function () {
      return (
        moveQueue.length == 0 &&
        currentMove.length == 0 &&
        cachedFireMoves.length == 0
      )
    }

    this.isAnimationFinished = function () {
      return currentMove.length == 0
    }

    this.applyMoves = function (moves, ts, applyingScramble = false) {
      var timestamp = ts || $.now()
      var movets = []
      for (var i = 0; i < moves.length; i++) {
        movets.push([moves[i], timestamp])
      }
      moveQueue = moveQueue.concat(movets)
      while (cachedFireMoves.length != 0) {
        twisty.advanceMoveCallback(twisty, cachedFireMoves[0][0])
        fireMoveEnded(cachedFireMoves.shift())
      }
      while (moveQueue.length > 0) {
        if (this.isAnimationFinished()) {
          startMove()
        }
        twisty.advanceMoveCallback(twisty, currentMove[0][0])
        if (applyingScramble) {
          currentMove.shift()
        } else {
          fireMoveEnded(currentMove.shift())
        }
        moveProgress.shift()
      }
      render()
    }

    var cachedFireMoves = []

    function stepAnimation(animationStep) {
      for (var i = 0; i < moveProgress.length; i++) {
        moveProgress[i] += animationStep
      }
      if (moveProgress[0] < 1) {
        for (var i = 0; i < currentMove.length; i++) {
          twisty.animateMoveCallback(
            twisty,
            currentMove[i][0],
            moveProgress[i],
            animationStep,
          )
        }
      } else {
        cachedFireMoves.push(currentMove.shift())
        moveProgress.shift()
        if (currentMove.length == 0) {
          while (cachedFireMoves.length != 0) {
            twisty.advanceMoveCallback(twisty, cachedFireMoves[0][0])
            fireMoveEnded(cachedFireMoves.shift())
          }
        }
        if (moveQueue.length == 0 && currentMove.length == 0) {
          stopAnimation()
        } else if (currentMove.length == 0) {
          startMove()
        }
      }
    }

    var pendingAnimationLoop = null

    function stopAnimation() {
      if (pendingAnimationLoop !== null) {
        cancelAnimationFrame(pendingAnimationLoop)
        pendingAnimationLoop = null
      }
    }

    function startAnimation() {
      if (pendingAnimationLoop === null) {
        //log("Starting move queue: " + movesToString(moveQueue));
        startMove()
        lastTimeStamp = $.now()
        pendingAnimationLoop = requestAnimationFrame(animateLoop, twistyCanvas)
      } else if (
        !currentMove[0] ||
        twisty.isParallelMove(twisty, currentMove[0][0], moveQueue[0][0])
      ) {
        //			console.log('parallel');
        startMove()
      }
    }

    var lastTimeStamp = 0

    function animateLoop(timeStamp) {
      timeStamp = $.now()
      var timeProgress =
        (((timeStamp - lastTimeStamp) /
          (kernel.getProp('vrcSpeed', 100) || 1e-3)) *
          (moveQueue.length + 2)) /
        2
      lastTimeStamp = timeStamp
      stepAnimation(
        Math.max(Math.min(timeProgress, 1), 0.0001) /*animationStep*/,
      )
      render()

      // That was fun, lets do it again!
      // We check pendingAnimationLoop first, because the loop
      // may have been cancelled during stepAnimation().
      if (pendingAnimationLoop !== null) {
        pendingAnimationLoop = requestAnimationFrame(animateLoop, twistyCanvas)
      }
    }

    function createTwisty(twistyType) {
      var twistyCreateFunction = twisties[twistyType.type]
      if (!twistyCreateFunction) {
        //			err('Twisty type "' + twistyType.type + '" is not recognized!');
        return null
      }

      // TODO - discuss the class heirarchy with Lucas
      //  Does it make sense for a TwistyScene to have an addMoves method?
      //  Scene implies (potentially) multiple twisties.
      //   Perhaps rename TwistyScene -> TwistyContainer?
      //  Alertatively, TwistyScene could become a Twisty base class,
      //  and twisty instances inherit useful stuff like addMoves.
      //
      //  I personally prefer the first method for a couple of reasons:
      //   1. Classical inheritance in javascript is funky. This isn't a good
      //      reson to not do it, just personal preference.
      //   2. Creating a new twisty doesn't force recreation of the TwistyScene.
      //      Maybe this isn't an important case to optimize for, but to me
      //      it's evidence that having a persistent TwistyScene is the right
      //      way to go.
      return twistyCreateFunction(that, twistyType)
    }
  }
  return twistyjs
})()

export default twistyjs
