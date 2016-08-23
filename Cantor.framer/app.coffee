Framer.Extras.Hints.disable()

kaColors = require "kaColors"
utils = require "utils"
{TextLayer} = require 'TextLayer'
Screen.backgroundColor = "white"

# Configuration, constants

enableAdditionExpressionForming = false
shouldReflowSecondAdditionArgument = true

enableBackgroundGrid = true
enableBlockGrid = true
enableBlockGridTicks = false
enableBlockDigitLabels = false

enableHighContrastGrid = false

debugShowLensFrames = false

# Canvas

selection = null
canvasComponent = new ScrollComponent
	backgroundColor: ""
	width: Screen.width
	height: Screen.height
canvas = canvasComponent.content
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
	canvasComponent.updateContent()

# Lenses

class Lens extends Layer
	constructor: (args) ->
		super args
		this.backgroundColor = ""
		this.value = args.value
		if debugShowLensFrames
			this.borderColor = "red"
			this.borderWidth = 1
		
class BlockLens extends Lens
	this.blockSize = 40
	this.resizeHandleSize = 60
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
				backgroundColor: kaColors.math1
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
		
		this.resizeHandle = new Layer
			parent: this
			width: BlockLens.resizeHandleSize
			height: BlockLens.resizeHandleSize
			borderRadius: BlockLens.resizeHandleSize / 2.0
			borderColor: kaColors.math2
			borderWidth: 6
			backgroundColor: ""
			
		this.resizeHandle.draggable.enabled = true
		this.resizeHandle.draggable.momentum = false
		this.resizeHandle.draggable.constraints = {x: BlockLens.blockSize, y: 0, width: BlockLens.blockSize * 10, height: this.value * BlockLens.blockSize}
		this.resizeHandle.draggable.overdrag = false
		this.resizeHandle.draggable.propagateEvents = false
		this.resizeHandle.on Events.DragMove, =>
			startPoint = this.resizeHandle.draggable.layerStartPoint 
			offset = this.resizeHandle.draggable.offset
			this.layout.numberOfColumns = Math.round((startPoint.x + offset.x) / BlockLens.blockSize)
			this.update()
		this.resizeHandle.on Events.DragEnd, =>
			this.layoutResizeHandle true
			
		this.reflowHandle = new ReflowHandle
			parent: this
		this.reflowHandle.midY = BlockLens.blockSize / 2 + 3
		this.reflowHandle.maxX = 0
		
		this.draggable.enabled = true
		this.draggable.momentum = false
		this.draggable.propagateEvents = false
		
		this.draggable.on Events.DragStart, =>	
			this.bringToFront()
				
		this.draggable.on Events.DragEnd, (event) =>
			this.animate
				properties:
					x: Math.round(this.x / BlockLens.blockSize) * BlockLens.blockSize
					y: Math.round(this.y / BlockLens.blockSize) * BlockLens.blockSize
				time: 0.2
	
		this.on Events.TouchStart, (event, layer) ->
   			 this.setBeingTouched(true)
   			 
   		this.on Events.TouchEnd, (even, layer) ->
   			this.setBeingTouched(false)
   			 
		this.onTap (event, layer) =>
			event.stopPropagation()
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
		this.layoutResizeHandle false
		this.layoutReflowHandle false
		this.setSelected(false)
		
	update: (animated) ->
		this.style["-webkit-filter"] = switch this.layout.state 
			when "tentative", "tentativeReceiving"
				"drop-shadow(0px 0px 15px #{kaColors.math1})"
			else null
					
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
		
		if not this.wedge.draggable.isDragging
			this.wedge.x = this.width + Wedge.restingX

	layoutResizeHandle: (animated) ->
		this.resizeHandle.animate
			properties:
				x: this.width - BlockLens.resizeHandleSize / 2
				y: this.height - BlockLens.resizeHandleSize / 2
			time: if animated then 0.1 else 0	
			
	layoutReflowHandle: (animated) ->
# 		this.reflowHandle.animate
# 			properties:
# 				x: Math.max(-BlockLens.resizeHandleSize / 2, this.reflowHandle.x)
# 				y: (BlockLens.blockSize - BlockLens.resizeHandleSize) / 2
# 			time: if animated then 0.1 else 0
			
	setSelected: (isSelected) ->
		return if (isSelected and selection == this) or (not isSelected and selection == null)

		selectionBorderWidth = 1
		this.x += if isSelected then -selectionBorderWidth else selectionBorderWidth
		this.y += if isSelected then -selectionBorderWidth else selectionBorderWidth
		
		selection?.setSelected(false) if selection != this
		this.borderWidth = if isSelected then selectionBorderWidth else 0
		this.resizeHandle.visible = isSelected
		this.reflowHandle.visible = isSelected
		this.wedge.visible = isSelected
		selection = if isSelected then this else null
	
	#gets called on touch down and touch up events
	setBeingTouched: (isBeingTouched) ->
	
		for block in this.blockLayers
			block.backgroundColor = if isBeingTouched then kaColors.math3 else kaColors.math1
			
			
			
	

		
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
		
		knob = new Layer
			parent: this
			backgroundColor: kaColors.math2
			width: ReflowHandle.knobSize
			height: ReflowHandle.knobSize
			borderRadius: ReflowHandle.knobSize / 2
			
		horizontalBrace = new Layer
			parent: this
			width: ReflowHandle.knobRightMargin + ReflowHandle.knobSize / 2
			height: 2
			x: knob.midX
			y: knob.midY
			backgroundColor: kaColors.math2
			
		verticalBrace = new Layer
			parent: this
			width: 5
			height: BlockLens.blockSize
			x: horizontalBrace.maxX
			midY: knob.midY
			backgroundColor: horizontalBrace.backgroundColor
			
		verticalKnobTrack = new Layer
			parent: this
			width: 2
			midX: knob.midX
			opacity: 0
		verticalKnobTrack.sendToBack()
			
		updateVerticalKnobTrackGradient = ->
			fadeLength = 75
			trackLengthBeyondKnob = 200
			trackColor = kaColors.math2
			transparentTrackColor = "rgba(85, 209, 229, 0.0)"
			
			bottomFadeStartingHeight = trackLengthBeyondKnob + Math.abs(knob.midY) + trackLengthBeyondKnob - fadeLength
			verticalKnobTrack.height = trackLengthBeyondKnob + Math.abs(knob.midY) + trackLengthBeyondKnob
			verticalKnobTrack.y = -trackLengthBeyondKnob + Math.min(0, knob.midY)
			verticalKnobTrack.style["-webkit-mask-image"] = "url(images/dash.png)"
			verticalKnobTrack.style.background = "-webkit-linear-gradient(top, #{transparentTrackColor} 0%, #{trackColor} #{fadeLength}px, #{trackColor} #{bottomFadeStartingHeight}px, #{transparentTrackColor} 100%)"
			
		updateVerticalKnobTrackGradient()
		
		this.width = verticalBrace.maxX
		this.height = verticalBrace.maxY
		
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
			
			this.parent.layout.firstRowSkip = utils.clip(Math.ceil(this.maxX / BlockLens.blockSize), 0, 9)
			this.parent.update()

			event.stopPropagation()
			
		this.onPanEnd ->
			isAnimating = true
			knobAnimation = knob.animate { properties: {y: 0}, time: 0.2 }
			knobAnimation.on Events.AnimationEnd, ->
				isAnimating = false
				
			updateVerticalTrackForAnimation = ->
				return unless isAnimating
				updateVerticalKnobTrackGradient()
				requestAnimationFrame updateVerticalTrackForAnimation
			requestAnimationFrame updateVerticalTrackForAnimation
			
			this.animate { properties: { maxX: BlockLens.blockSize * this.parent.layout.firstRowSkip }, time: 0.2}
			
			event.stopPropagation()
			
		this.on Events.TouchStart, (event, layer) ->
   			event.stopPropagation()
   			 
   		this.on Events.TouchEnd, (even, layer) ->
   			event.stopPropagation()
			

class Wedge extends Layer
	this.restingX = 30
	this.splitY = 30

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
			if (this.minX <= this.parent.width) and (this.parent.layout.rowSplitIndex > 0)
				this.parent.splitAt(this.parent.layout.rowSplitIndex)
			else
				this.animate { properties: { x: this.parent.width + Wedge.restingX }, time: 0.2 }
			
		this.onTap (event) -> event.stopPropagation()
		this.on Events.TouchStart, (event, layer) ->
   			event.stopPropagation()
   			 
   		this.on Events.TouchEnd, (even, layer) ->
   			event.stopPropagation()

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
	width: Screen.width
	backgroundColor: kaColors.cs1
	height: 88
	y: -88
addBlockPromptLabelText = new TextLayer
	parent: addBlockPromptLabel
	text: "Touch and drag to add a value"
	textAlign: "center"
	fontSize: 40
	color: kaColors.white
	autoSize: true
	y: Align.center()
	width: Screen.width
			
addButton = new GlobalButton
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
	backgroundColor: "rgba(255, 255, 255, 1.0)"
	borderRadius: 4
	textAlign: "center"
	paddingTop: 5
		
canvas.onPan (event) ->
	return unless isAdding
	
	value = 10 * Math.max(0, Math.floor((event.point.y - event.start.y) / BlockLens.blockSize)) + utils.clip(Math.ceil((event.point.x - event.start.x) / BlockLens.blockSize), 0, 10)
	value = Math.max(1, value)
	return if value == pendingBlockToAdd?.value
	
	startingLocation = Screen.convertPointToLayer(event.start, canvas)
	startingLocation.x = Math.round(startingLocation.x / BlockLens.blockSize) * BlockLens.blockSize
	startingLocation.y = Math.round(startingLocation.y / BlockLens.blockSize) * BlockLens.blockSize - BlockLens.blockSize * 2
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
		
canvas.onTouchEnd ->
	return unless isAdding
	pendingBlockToAdd?.borderWidth = 0
	pendingBlockToAdd = null
	
	pendingBlockToAddLabel.visible = false
	setIsAdding false
			
# Setup

startingOffset = 40 * 60
setup = ->
	testBlock = new BlockLens
		value: 37
		parent: canvas
		x: 200
		y: 80
		
	testBlock2 = new BlockLens
		value: 15
		parent: canvas
		x: 200
		y: 280
	
	# testBlock2 = new BlockLens
	# 	value: 82
	# 	parent: canvas
	# 	x: 200
	# 	y: 600
	
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