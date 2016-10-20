# Everything was designed for @2x displays (which... Framer claims has have a contentScale of 1.0), so if Framer is running for a desktop display, we'll need to scale.
Framer.Device.contentScale = if Framer.Device.deviceType == "fullscreen" then 0.5 else 1.0
Screen.backgroundColor = "white"
Framer.Extras.Hints.disable()

kaColors = require "kaColors"
utils = require "utils"
{TextLayer} = require "TextLayer"
RecorderUtility = require "recorder"
{deepEqual} = require "npm"

# Configuration, constants

enableAdditionExpressionForming = false
shouldReflowSecondAdditionArgument = true

enableBackgroundGrid = true
enableBlockGrid = true
enableBlockGridTicks = false
enableBlockDigitLabels = false
enableDistinctColoringForOnesBlocks = true

enableHighContrastGrid = false

debugShowLensFrames = false

# Canvas

rootLayer = new Layer
	backgroundColor: ""
	width: Screen.width / Framer.Device.contentScale
	height: Screen.height / Framer.Device.contentScale

selection = null
canvasComponent = new ScrollComponent
	backgroundColor: ""
	parent: rootLayer
	width: rootLayer.width
	height: rootLayer.height
canvas = canvasComponent.content
canvas.nextPersistentID = 1 # TODO: Make a real canvas data structure...
canvas.onTap (event, layer) ->
	selection?.setSelected(false) if not layer.draggable.isDragging
canvasComponent.content.pinchable.enabled = true
canvasComponent.content.pinchable.minScale = 0.5
canvasComponent.content.pinchable.maxScale = 2
canvasComponent.content.pinchable.rotate = false

if enableBackgroundGrid
	grid = new Layer
		parent: canvas
		width: Screen.width * 10
		height: Screen.height * 10
	grid.style["background"] = "url('images/#{if enableHighContrastGrid then "grid-high-contrast.svg" else "grid.svg"}')"
	grid.skipRecording = true
	canvasComponent.updateContent()

# Lenses

class Lens extends Layer
	constructor: (args) ->
		super args
		this.backgroundColor = ""
		this.value = args.value
		this.persistentID = args.persistentID
		if !this.persistentID
			# Recordings' persistent IDs should be in a different "namespace" than users'.
			this.persistentID = canvas.nextPersistentID * (if recorder.isRecording then -1 else 1)
			canvas.nextPersistentID += 1
		if debugShowLensFrames
			this.borderColor = "red"
			this.borderWidth = 1

class BlockLens extends Lens
	this.blockSize = 40
	this.interiorBorderColor = if enableBlockGrid then "rgba(85, 209, 229, 0.4)" else ""
	this.interiorBorderWidth = if enableBlockGrid then 1 else 0

	constructor: (args) ->
		super args

		this.layout = if args.layout
			Object.assign({}, args.layout)
		else
			numberOfColumns: 10
			firstRowSkip: 0
			state: "static"

		this.blockLayers = []
		for blockNumber in [0...this.value]
			block = new Layer
				parent: this
				width: BlockLens.blockSize
				height: BlockLens.blockSize
				borderColor: BlockLens.interiorBorderColor
				borderWidth: if enableBlockGrid then 1 else 0
			this.blockLayers.push block

		if enableBlockGridTicks
			this.onesTick = new Layer
				parent: this
				backgroundColor: kaColors.white
				x: BlockLens.blockSize * 5 - 1
				y: 0
				width: 2
				height: BlockLens.blockSize

			this.tensTicks = []
			for tensTickIndex in [0...Math.floor(this.value / 20)]
				tensTick = new Layer
					parent: this
					backgroundColor: kaColors.white
					x: 0
					y: BlockLens.blockSize * (tensTickIndex + 1) * 2
					width: BlockLens.blockSize * 10
					height: 2
				this.tensTicks.push(tensTick)

		this.style["-webkit-border-image"] = "url('images/ants.gif') 1 repeat repeat"

		this.wedge = new Wedge { parent: this }

		this.resizeHandle = new ResizeHandle {parent: this}

		this.reflowHandle = new ReflowHandle {parent: this}
		this.reflowHandle.midY = BlockLens.blockSize / 2 + 2
		this.reflowHandle.maxX = 0

		this.draggable.enabled = true
		this.draggable.momentum = false
		this.draggable.propagateEvents = false

		this.draggable.on Events.DragEnd, (event) =>
			this.animate
				properties:
					x: Math.round(this.x / BlockLens.blockSize) * BlockLens.blockSize
					y: Math.round(this.y / BlockLens.blockSize) * BlockLens.blockSize
				time: 0.2

		# Hello greetings. You will notice that these TouchStart and TouchEnd methods have some hit testing garbage in them. That's because Framer can't deal with event cancellation correctly for this highlight behavior vs. children's gestures (i.e. the reflow handle and wedge). This is sad. Maybe someday we'll make Framer better.
		this.on Events.TouchStart, (event, layer) ->
			this.bringToFront()
			point = Canvas.convertPointToLayer({x: event.pageX, y: event.pageY}, this.parent)
			return unless utils.pointInsideLayer(this, point)
			this.setBeingTouched(true) unless event.shiftKey

		this.on Events.TouchEnd, (event, layer) ->
			this.setBeingTouched(false)

		this.onTap (event, layer) =>
			event.stopPropagation()
			if event.shiftKey
				this.flash()
			else
				this.setSelected(true) unless this.draggable.isDragging

		if enableBlockDigitLabels
			this.digitLabel = new TextLayer
				x: 42
				fontFamily: "Helvetica"
				text: this.value
				parent: this
				color: kaColors.math1
				fontSize: 34
				autoSize: true
				backgroundColor: "rgba(255, 255, 255, 1.0)"
				borderRadius: 5
				textAlign: "center"
				paddingTop: 5
			this.digitLabel.width += 12
			this.digitLabel.height += 5

		this.update()
		this.resizeHandle.updatePosition false
		this.layoutReflowHandle false
		this.setSelected(false)

	getState: ->
		value: this.value
		layout: Object.assign {}, this.layout
		isSelected: selection == this

	applyState: (newState) ->
		this.value = newState.value
		Object.assign this.layout, newState.layout

		if selection != this and newState.isSelected
			this.setSelected true
		else if selection == this and not newState.isSelected
			this.setSelected false

		this.update false

	flash: ->
		spread = 25
		setShadow = =>
			spread -= 1
			if spread <= 0
				this.style["-webkit-filter"] = null
			else
				this.style["-webkit-filter"] = "drop-shadow(0px 0px #{spread}px #{kaColors.math1})"
				requestAnimationFrame setShadow
		setShadow()

	update: (animated) ->
		for blockNumber in [0...this.value]
			blockLayer = this.blockLayers[blockNumber]
			indexForLayout = blockNumber + this.layout.firstRowSkip
			columnNumber = indexForLayout % this.layout.numberOfColumns
			newX = BlockLens.blockSize * columnNumber
			rowNumber = Math.floor(indexForLayout / this.layout.numberOfColumns)
			newY = BlockLens.blockSize * rowNumber
			if (this.layout.rowSplitIndex != null) and (rowNumber >= this.layout.rowSplitIndex)
				newY += Wedge.splitY
			if animated
				blockLayer.animate {properties: {x: newX, y: newY}, time: 0.15}
			else
				blockLayer.props = {x: newX, y: newY}

			# Update the borders:
			heavyStrokeColor = kaColors.white
			setBorder = (side, heavy) ->
				blockLayer.style["border-#{side}-color"] = if heavy then heavyStrokeColor else BlockLens.interiorBorderColor
				blockLayer.style["border-#{side}-width"] = if heavy then "2px" else "#{BlockLens.interiorBorderWidth}px"

			lastRow = Math.ceil((this.value + this.layout.firstRowSkip) / this.layout.numberOfColumns)
			lastRowExtra = (this.value + this.layout.firstRowSkip) - (lastRow - 1) * this.layout.numberOfColumns
			setBorder "left", columnNumber == 0 or blockNumber == 0
			setBorder "top", rowNumber == 0 or (rowNumber == 1 and columnNumber < this.layout.firstRowSkip)
			setBorder "bottom", rowNumber == (lastRow - 1) or (rowNumber == (lastRow - 2) and columnNumber >= lastRowExtra)
			setBorder "right", columnNumber == this.layout.numberOfColumns - 1 or (rowNumber == (lastRow - 1) and columnNumber == (lastRowExtra - 1))

			blockLayer.backgroundColor = if this.isBeingTouched then kaColors.math3 else kaColors.math1
			if enableDistinctColoringForOnesBlocks and ((rowNumber == (lastRow - 1) and lastRowExtra < this.layout.numberOfColumns) or (rowNumber == 0 and this.layout.firstRowSkip > 0))
				blockLayer.backgroundColor = if this.isBeingTouched then kaColors.science3 else kaColors.science1

		# Resize lens to fit blocks.
		contentFrame = this.contentFrame()
		this.width = BlockLens.blockSize * this.layout.numberOfColumns + 2
		this.height = this.blockLayers[this.value - 1].maxY + 2

		# Update the grid ticks:
		if enableBlockGridTicks
			this.onesTick.height = Math.floor((this.value + this.layout.firstRowSkip) / this.layout.numberOfColumns) * BlockLens.blockSize
			# If the first row starts after 5, hide the ones tick.
			if this.layout.firstRowSkip >= 5
				this.onesTick.y = BlockLens.blockSize
				this.onesTick.height -= BlockLens.blockSize
			else
				this.onesTick.y = 0
			# If the last row doesn't reach the 5s place, make it a bit shorter.
			lastRowLength = (this.value + this.layout.firstRowSkip) % this.layout.numberOfColumns
			this.onesTick.height += BlockLens.blockSize if lastRowLength >= 5
			this.onesTick.visible = Math.min(this.value, this.layout.numberOfColumns) >= 5
			tensTick.width = (BlockLens.blockSize * this.layout.numberOfColumns) for tensTick in this.tensTicks

		if enableBlockDigitLabels
			this.digitLabel.midY = this.height / 2

		this.resizeHandle.visible = (selection == this) and (this.layout.state != "tentativeReceiving")
		this.resizeHandle.updateSublayers()

		if not this.wedge.draggable.isDragging
			this.wedge.x = this.width + Wedge.restingX

	layoutReflowHandle: (animated) ->
# 		this.reflowHandle.animate
# 			properties:
# 				x: Math.max(-BlockLens.resizeHandleSize / 2, this.reflowHandle.x)
# 				y: (BlockLens.blockSize - BlockLens.resizeHandleSize) / 2
# 			time: if animated then 0.1 else 0

	setSelected: (isSelected) ->
		selectionBorderWidth = 1
		selection?.setSelected(false) if selection != this
		this.borderWidth = if isSelected then selectionBorderWidth else 0
		this.resizeHandle.visible = isSelected
		this.reflowHandle.visible = isSelected
		this.wedge.visible = isSelected

		if (isSelected and selection != this) or (not isSelected and selection == this)
			this.x += if isSelected then -selectionBorderWidth else selectionBorderWidth
			this.y += if isSelected then -selectionBorderWidth else selectionBorderWidth

		selection = if isSelected then this else null

	#gets called on touch down and touch up events
	setBeingTouched: (isBeingTouched) ->
		this.isBeingTouched = isBeingTouched
		this.update()

	splitAt: (rowSplitIndex) ->
		newValueA = Math.min(rowSplitIndex * this.layout.numberOfColumns - this.layout.firstRowSkip, this.value)
		newValueB = this.value - newValueA

		this.layout.rowSplitIndex = null

		newBlockA = new BlockLens
			value: newValueA
			parent: this.parent
			x: this.x
			y: this.y
			layout: this.layout

		this.layout.firstRowSkip = 0
		newBlockB = new BlockLens
			value: newValueB
			parent: this.parent
			x: this.x
			y: newBlockA.maxY + Wedge.splitY
			layout: this.layout

		this.destroy()


class ReflowHandle extends Layer
	this.knobSize = 30
	this.knobRightMargin = 45

	constructor: (args) ->
		throw "Requires parent layer" if args.parent == null

		super args
		this.props =
			backgroundColor: ""
			width: 110
			height: 110

		verticalBrace = new Layer
			parent: this
			width: 5
			height: BlockLens.blockSize
			maxX: this.maxX
			midY: this.midY
			backgroundColor: kaColors.math2

		horizontalBrace = new Layer
			parent: this
			width: ReflowHandle.knobRightMargin + ReflowHandle.knobSize / 2
			height: 2
			maxX: verticalBrace.x
			midY: this.midY
			backgroundColor: kaColors.math2

		knob = new Layer
			parent: this
			backgroundColor: kaColors.math2
			width: ReflowHandle.knobSize
			height: ReflowHandle.knobSize
			midX: horizontalBrace.x
			midY: this.midY
			borderRadius: ReflowHandle.knobSize / 2


		verticalKnobTrack = new Layer
			parent: this
			width: 2
			midX: knob.midX
			opacity: 0
		verticalKnobTrack.sendToBack()

		updateVerticalKnobTrackGradient = =>
			fadeLength = 75
			trackLengthBeyondKnob = 200
			trackColor = kaColors.math2
			transparentTrackColor = "rgba(85, 209, 229, 0.0)"

			bottomFadeStartingHeight = trackLengthBeyondKnob + Math.abs(knob.midY) + trackLengthBeyondKnob - fadeLength
			verticalKnobTrack.height = trackLengthBeyondKnob + Math.abs(knob.midY) + trackLengthBeyondKnob
			verticalKnobTrack.y = -trackLengthBeyondKnob + this.midY + Math.min(0, knob.midY)
			verticalKnobTrack.style["-webkit-mask-image"] = "url(images/dash.png)"
			verticalKnobTrack.style.background = "-webkit-linear-gradient(top, #{transparentTrackColor} 0%, #{trackColor} #{fadeLength}px, #{trackColor} #{bottomFadeStartingHeight}px, #{transparentTrackColor} 100%)"

		updateVerticalKnobTrackGradient()

		this.onTouchStart ->
			knob.animate { properties: {scale: 2}, time: 0.2 }
			verticalKnobTrack.animate { properties: {opacity: 1}, time: 0.2}

		this.onTouchEnd ->
			knob.animate { properties: {scale: 1}, time: 0.2 }
			verticalKnobTrack.animate { properties: {opacity: 0}, time: 0.2}

		this.onPan (event) ->
			knob.y += event.delta.y
			this.x += event.delta.x
			updateVerticalKnobTrackGradient()

			this.parent.layout.firstRowSkip = utils.clip(Math.ceil(this.maxX / BlockLens.blockSize), 0, this.parent.layout.numberOfColumns - 1)
			this.parent.update()

			event.stopPropagation()

		this.onPanEnd =>
			isAnimating = true
			knobAnimation = knob.animate { properties: {midY: this.height / 2}, time: 0.2 }
			knobAnimation.on Events.AnimationEnd, ->
				isAnimating = false

			updateVerticalTrackForAnimation = ->
				return unless isAnimating
				updateVerticalKnobTrackGradient()
				requestAnimationFrame updateVerticalTrackForAnimation
			requestAnimationFrame updateVerticalTrackForAnimation

			this.animate { properties: { maxX: BlockLens.blockSize * this.parent.layout.firstRowSkip }, time: 0.2}

			event.stopPropagation()

class ResizeHandle extends Layer
	this.knobSize = 30
	# This is kinda complicated... because we don't want touches on the resize handle to conflict with touches on the blocks themselves, we make it easier to "miss" the resize handle down and to the right of its actual position than up or to the left.
	this.knobHitTestBias = 10

	constructor: (args) ->
		throw "Requires parent layer" if args.parent == null

		super args
		this.props =
			backgroundColor: ""
			width: 88

		knob = new Layer
			parent: this
			backgroundColor: ""
			midX: this.midX + ResizeHandle.knobHitTestBias
			width: this.width
			height: this.width
		this.knob = knob

		knobDot = new Layer
			parent: knob
			backgroundColor: kaColors.math2
			midX: knob.width / 2 - ResizeHandle.knobHitTestBias
			midY: knob.midY -  ResizeHandle.knobHitTestBias
			width: ResizeHandle.knobSize
			height: ResizeHandle.knobSize
			borderRadius: ResizeHandle.knobSize / 2

		this.verticalBrace = new Layer
			parent: this
			width: 5
			midX: this.midX
			backgroundColor: kaColors.math2

		verticalKnobTrack = new Layer
			parent: this
			width: 2
			midX: this.midX
			opacity: 0
		verticalKnobTrack.sendToBack()

		this.updateVerticalKnobTrackGradient = =>
			fadeLength = 150
			trackLengthBeyondKnob = 250
			trackColor = kaColors.math2
			transparentTrackColor = "rgba(85, 209, 229, 0.0)"

			bottomFadeStartingHeight = knob.midY - this.verticalBrace.maxY
			verticalKnobTrack.height = knob.midY - this.verticalBrace.maxY + trackLengthBeyondKnob
			verticalKnobTrack.y = this.verticalBrace.maxY
			verticalKnobTrack.style["-webkit-mask-image"] = "url(images/dash.png)"
			verticalKnobTrack.style.background = "-webkit-linear-gradient(top, #{trackColor} 0%, #{trackColor} #{bottomFadeStartingHeight}px, #{transparentTrackColor} 100%)"

		this.updateVerticalKnobTrackGradient()

		this.knob.onTouchStart =>
			knobDot.animate { properties: { scale: 2 }, time: 0.2 }
			verticalKnobTrack.animate { properties: { opacity: 1 }, time: 0.2}

			# This is pretty hacky, even for a prototype. Eh.
			this.parent.wedge.animate { properties: { opacity: 0 }, time: 0.2 }

		this.knob.onTouchEnd =>
			knobDot.animate { properties: { scale: 1 }, time: 0.2 }
			verticalKnobTrack.animate { properties: { opacity: 0 }, time: 0.2}
			this.parent.wedge.animate { properties: { opacity: 1 }, time: 0.4, delay: 0.4 }

		this.knob.onPan (event) =>
			knob.y += event.delta.y
			this.x += event.delta.x
			this.updateVerticalKnobTrackGradient()

			this.parent.layout.numberOfColumns = Math.max(1, Math.floor((this.x + this.verticalBrace.x) / BlockLens.blockSize))
			this.parent.update()

			event.stopPropagation()

		this.knob.onPanEnd =>
			this.updatePosition true
			event.stopPropagation()

	updateSublayers: ->
		this.verticalBrace.y = 0
		this.verticalBrace.height = this.parent.height - this.y
		this.height = this.knob.maxY

	updatePosition: (animated) ->
		this.y = 2
		this.animate
			properties: { midX: BlockLens.blockSize * this.parent.layout.numberOfColumns + 2 }
			time: if animated then 0.2 else 0

		isAnimating = true
		knobAnimation = this.knob.animate
			properties: { midY: this.parent.height - this.y + ResizeHandle.knobHitTestBias }
			time: if animated then 0.2 else 0
		knobAnimation.on Events.AnimationEnd, ->
			isAnimating = false

		updateVerticalTrackForAnimation = =>
			this.updateSublayers()
			return unless isAnimating
			this.updateVerticalKnobTrackGradient()
			requestAnimationFrame updateVerticalTrackForAnimation
		requestAnimationFrame updateVerticalTrackForAnimation

class Wedge extends Layer
	this.restingX = 30
	this.splitY = BlockLens.blockSize

	constructor: (args) ->
		throw "Requires parent layer" if args.parent == null
		super args
		this.props =
			image: "images/triangle@2x.png"
			width: 80
			height: 40
			backgroundColor: ""
			x: Wedge.restingX
			scaleX: -1

		this.draggable.enabled = true
		this.draggable.momentum = false
		this.draggable.propagateEvents = false

		this.draggable.on Events.DragMove, (event) =>
			this.parent.layout.rowSplitIndex = if this.minX <= this.parent.width
				Math.round(this.midY / BlockLens.blockSize)
			else
				null
			this.parent.update(true)

		this.draggable.on Events.DragEnd, (event) =>
			if (this.minX <= this.parent.width) and (this.parent.layout.rowSplitIndex > 0) and (this.parent.layout.rowSplitIndex <= Math.floor(this.parent.value / this.parent.layout.numberOfColumns))
				this.parent.splitAt(this.parent.layout.rowSplitIndex)
			else
				this.animate
					properties: { x: this.parent.width + Wedge.restingX, y: 0 }
					time: 0.2

		this.onTap (event) -> event.stopPropagation()

# Controls

class GlobalButton extends Layer
	constructor: (args) ->
		super args
		props =
			backgroundColor: kaColors.white
			borderColor: kaColors.gray76
			borderRadius: 4
			borderWidth: 1
			width: 100
			height: 100
		Object.assign(props, args)
		this.props = props
		this.action = args.action

		originalBackgroundColor = this.backgroundColor
		this.onTouchStart ->
			this.backgroundColor = kaColors.gray95
		# TODO implement proper button hit-testing-on-move behavior
		this.onTouchEnd ->
			this.backgroundColor = originalBackgroundColor
			this.action?()

addBlockPromptLabel = new Layer
	parent: rootLayer
	width: rootLayer.width
	backgroundColor: kaColors.cs1
	height: 88
	y: -88
	index: 500
addBlockPromptLabelText = new TextLayer
	parent: addBlockPromptLabel
	text: "Touch and drag to add a value"
	textAlign: "center"
	fontSize: 40
	color: kaColors.white
	autoSize: true
	y: Align.center()
	width: addBlockPromptLabel.width

state = 0
nextButton = new GlobalButton
	parent: rootLayer
	x: Align.right(-160)
	y: Align.bottom(-20)
	action: ->
		state = state + 1
		recorder.playSavedRecording state
nextButton.html = "<div style='color: #{kaColors.math1}; font-size: 60px; text-align: center; margin: 35% 0%'>➡️</div>"

addButton = new GlobalButton
	parent: rootLayer
	x: Align.right(-20)
	y: Align.bottom(-20)
	action: ->
		setIsAdding(not isAdding)

isAdding = null
setIsAdding = (newIsAdding) ->
	return if newIsAdding == isAdding
	isAdding = newIsAdding
	if isAdding
		canvasComponent.scroll = false
	else
		canvasComponent.scroll = true
	addBlockPromptLabel.animate
		properties: {y: if isAdding then 0 else -addBlockPromptLabel.height}
		time: 0.2
	addButton.html = "<div style='color: #{kaColors.math1}; font-size: 70px; text-align: center; margin: 25% 0%'>#{if isAdding then 'x' else '+'}</div>"

setIsAdding(false)

pendingBlockToAdd = null
pendingBlockToAddLabel = new TextLayer
	fontFamily: "Helvetica"
	parent: canvas
	color: kaColors.math1
	fontSize: 72
	autoSize: true
	backgroundColor: "rgba(255, 255, 255, 0.9)"
	borderRadius: 4
	textAlign: "center"
	paddingTop: 10
	paddingLeft: 10
	paddingRight: 10
	paddingBottom: 10
	borderRadius: 4

canvas.onPanStart ->
	return unless isAdding

	pendingBlockToAddLabel.bringToFront()

canvas.onPan (event) ->
	return unless isAdding

	value = 10 * Math.max(0, Math.floor((event.point.y - event.start.y) / BlockLens.blockSize)) + utils.clip(Math.ceil((event.point.x - event.start.x) / BlockLens.blockSize), 0, 10)
	value = Math.max(1, value)
	return if value == pendingBlockToAdd?.value

	startingLocation = Screen.convertPointToLayer(event.start, canvas)
	startingLocation.x = Math.floor(startingLocation.x / BlockLens.blockSize) * BlockLens.blockSize
	startingLocation.y = Math.floor(startingLocation.y / BlockLens.blockSize) * BlockLens.blockSize - BlockLens.blockSize * 1
	pendingBlockToAdd?.destroy()
	pendingBlockToAdd = new BlockLens
		parent: canvas
		x: startingLocation.x
		y: startingLocation.y
		value: value
	pendingBlockToAdd.borderWidth = 1

	pendingBlockToAddLabel.visible = true
	pendingBlockToAddLabel.text = pendingBlockToAdd.value
	pendingBlockToAddLabel.midX = startingLocation.x + BlockLens.blockSize * 5
	pendingBlockToAddLabel.y = startingLocation.y - 100

canvas.onPanEnd ->
	return unless isAdding
	pendingBlockToAdd?.borderWidth = 0
	pendingBlockToAdd = null

	pendingBlockToAddLabel.visible = false
	setIsAdding false

# Recording and playback

class Recorder
	baseRecordingTime: null
	recordedEvents: []
	isPlayingBackRecording: false
	isRecording: false

	constructor: (relevantLayerGetter) ->
		window.AudioContext = window.AudioContext || window.webkitAudioContext
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
		this.audioContext = new AudioContext

		window.addEventListener("keydown", (event) =>
			key = String.fromCharCode(event.keyCode)
			if key == "C"
				this.clear()
			if key == "P"
				this.startPlaying()
			if key == "R"
				if this.isRecording
					this.stopRecording()
				else
					this.startRecording()
			if key == "D"
				this.downloadRecording()
		)
		this.relevantLayerGetter = relevantLayerGetter

		this.ignoredPersistentIDs = new Set()
		this.highestIDToTouchInRecordings = 0

	playSavedRecording: (recordingName) =>
		JSONRequest = new XMLHttpRequest()
		JSONRequest.onreadystatechange = =>
			if JSONRequest.readyState == 4
				# We do an awkward little pass here as we read in the JSON to make sure all the persistent IDs are negative. We associate negative IDs with recordings and treat them separately from users' blocks. We never want to delete a user's blocks, for instance.
				events = JSON.parse(JSONRequest.responseText, (key, value) ->
					if key == "persistentIDs"
						negativeIDs = value.map (id) -> Math.abs(parseInt(id)) * -1
						return new Set(negativeIDs)
					else
						return value
				)
				this.recordedEvents = events.map (event) ->
					newRecords = {}
					for layerPersistentID, layerRecord of event.layerRecords
						if layerPersistentID[0] != "-"
							layerPersistentID = "-" + layerPersistentID
						newRecords[layerPersistentID] = layerRecord
					event.layerRecords = newRecords
					return event
				audio = new Audio("recordings/#{recordingName}.wav?nocache=#{Date.now()}");
				audio.addEventListener "ended", () => this.stopPlaying()
				audio.play()
				this.startPlaying()
		JSONRequest.open "GET", "recordings/#{recordingName}.json?nocache=#{Date.now()}", true
		JSONRequest.send()

	clear: =>
		this.recordedEvents = []
		this.recorder?.clear()
		this.ignoredPersistentIDs.clear()

	startPlaying: =>
		return if this.isRecording or this.isPlayingBackRecording

		this.basePlaybackTime = window.performance.now()
		this.lastAppliedTime = -1
		this.isPlayingBackRecording = true

		this.playingLayer = new TextLayer
			parent: rootLayer
			x: Align.left(40)
			y: Align.bottom(-53)
			fontSize: 32
			autoSize: true
			color: kaColors.cs1
			text: "Playing…"

		this.play this.basePlaybackTime

		return unless this.recorder
		this.recorder.getBuffer (buffers) =>
			newSource = this.audioContext.createBufferSource()
			newBuffer = this.audioContext.createBuffer 2, buffers[0].length, this.audioContext.sampleRate
			newBuffer.getChannelData(0).set buffers[0]
			newBuffer.getChannelData(1).set buffers[1]
			newSource.buffer = newBuffer
			newSource.addEventListener "ended", (event) => this.stopPlaying()
			newSource.connect this.audioContext.destination
			newSource.start 0

	play: (timestamp) =>
		# Find the relevant event...
		for event in this.recordedEvents by -1
			# We'll play the soonest event we haven't already played.
			if event.time <= (timestamp - this.basePlaybackTime) and event.time > this.lastAppliedTime
				relevantLayers = this.relevantLayerGetter()
				# Found it! Apply each layer's record:
				for layerPersistentID, layerRecord of event.layerRecords
					# Find the live layer layer that corresponds to this.
					# TODO: something less stupid slow... if it ends up being necessary.
					persistentIDComponents = layerPersistentID.split("/").map (component) -> parseInt(component)
					basePersistentID = persistentIDComponents[0]
					continue if this.ignoredPersistentIDs.has(basePersistentID)
					workingLayer = relevantLayers.find (testLayer) ->
						testLayer.persistentID == basePersistentID

					# What if the base persistent layer doesn't exist? i.e. a layer was added during the recording?
					if (not workingLayer) and persistentIDComponents.length == 1
						# For now assume it's a BlockLens.
						args = Object.assign {}, layerRecord.props
						Object.assign args, layerRecord.state
						args.persistentID = basePersistentID
						args.parent = canvas
						workingLayer = new BlockLens args

						relevantLayers = this.relevantLayerGetter() # Recompute working set of layers...

					for index in persistentIDComponents[1..]
						workingLayer = workingLayer.children.find (child) ->
							child.index == index
					workingLayer.style.cssText = layerRecord.style
					workingLayer.props = layerRecord.props
					if layerRecord.state
						workingLayer.applyState layerRecord.state

				# Clean up all persistent IDs that don't appear in the list.
				for layer in relevantLayers when layer.persistentID <= this.highestIDToTouchInRecordings # < 0 here coupled with recording-created namespacing.
					if !event.persistentIDs.has(layer.persistentID)
						layer.visible = false

				this.lastAppliedTime = event.time

				if event == this.recordedEvents[this.recordedEvents.length - 1]
					return
				else
					break
		requestAnimationFrame this.play

	stopPlaying: =>
		this.isPlayingBackRecording = false
		this.playingLayer.destroy()

		if this.recordedEvents.length > 0
			lastEvent = this.recordedEvents[this.recordedEvents.length - 1]
			lastEvent.persistentIDs.forEach (persistentID) =>
				this.ignoredPersistentIDs.add	persistentID

	startRecording: =>
		this.recordingLayer = new TextLayer
			parent: rootLayer
			x: Align.left(40)
			y: Align.bottom(-53)
			fontSize: 32
			autoSize: true
			color: kaColors.humanities1
			text: "Recording…"

		this.isRecording = true
		actuallyStartRecording = =>
			this.clear()
			this.baseRecordingTime = window.performance.now()
			this.record this.baseRecordingTime

		if navigator.getUserMedia
			navigator.getUserMedia({audio: true}, (stream) =>
				input = this.audioContext.createMediaStreamSource stream
				this.recorder = new RecorderUtility(input)
				this.recorder.record()
				actuallyStartRecording()
			, (error) =>
				print "Audio input error: #{error.name}"
				actuallyStartRecording()
			)
		else
			actuallyStartRecording()

	stopRecording: =>
		this.recordingLayer?.destroy()
		this.isRecording = false
		this.recorder?.stop()
		this.highestIDToTouchInRecordings = canvas.nextPersistentID - 1

	downloadRecording: =>
		return unless this.recorder
		this.recorder.exportWAV (blob) =>
			recordingFilename = new Date().toISOString()
			this.saveData blob, recordingFilename + '.wav'

			eventsJSON = JSON.stringify(this.recordedEvents, (key, value) ->
				if key == "persistentIDs"
					return Array.from(value)
				else if value instanceof Color
					return value.toRgbString()
				else
					return value
			)
			eventsBlob = new Blob [eventsJSON], {type: "application/json"}
			this.saveData eventsBlob, recordingFilename + '.json'

	saveData: (blob, fileName) =>
		a = document.createElement "a"
		document.body.appendChild a
		a.style = "display: none";
		url = window.URL.createObjectURL(blob)
		a.href = url
		a.download = fileName
		a.click()
		window.URL.revokeObjectURL(url)

	recordingIDForLayer: (layer) =>
		# TODO: cache?
		if layer.persistentID then return layer.persistentID
		path = layer.index
		currentLayer = layer.parent
		while currentLayer and currentLayer != canvas
			currentLayerComponent = currentLayer.persistentID || currentLayer.index
			path = "#{currentLayerComponent}/#{path}"
			return path if currentLayer.persistentID
			currentLayer = currentLayer.parent

	record: (timestamp) =>
		return unless this.isRecording

		layerRecords = {}
		layerRecordCount = 0
		persistentIDs = new Set
		for layer in this.relevantLayerGetter()
			continue if layer.skipRecording
			recordingID = this.recordingIDForLayer(layer)
			continue unless recordingID

			# Find the last time this layer appeared in our recording.
			lastLayerRecord = null
			for recordedEvent in this.recordedEvents by -1
				lastLayerRecord = recordedEvent.layerRecords[recordingID]
				break if lastLayerRecord

			props = layer.props
			# Here assuming that the state can't change if the style doesn't change. Not a great long-term assumption.
			if !lastLayerRecord or !deepEqual(lastLayerRecord.props, props)
				layerRecords[recordingID] =
					props: props
					style: layer.style.cssText # We write down both props and style because some style stuff is not captured in props. This is super wasteful.
					state: layer.getState?()
				layerRecordCount += 1

			persistentIDs.add layer.persistentID if layer.persistentID

		if layerRecordCount > 0
			event =
				time: timestamp - this.baseRecordingTime
				layerRecords: layerRecords
				persistentIDs: persistentIDs
			this.recordedEvents.push event

		requestAnimationFrame this.record

recorder = new Recorder ->
	result = canvas.descendants
	result.push(canvas)
	return result

# Setup

startingOffset = 40 * 60
setup = ->
	for sublayer in canvas.subLayers
		continue unless (sublayer instanceof BlockLens)
		sublayer.x += startingOffset
		sublayer.y += startingOffset

setup()

canvasComponent.scrollX = startingOffset
canvasComponent.scrollY = startingOffset
grid.x -= startingOffset
grid.y -= startingOffset

grid.onDoubleTap (event) =>
	if event.fingers > 1
		for layer in canvas.subLayers
			continue unless (layer instanceof BlockLens)
			layer.destroy()
		setup()
