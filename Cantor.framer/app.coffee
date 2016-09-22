# Everything was designed for @2x displays (which... Framer claims has have a contentScale of 1.0), so if Framer is running for a desktop display, we'll need to scale.
Framer.Device.contentScale = if Framer.Device.deviceType == "fullscreen" then 0.5 else 1.0
Screen.backgroundColor = "white"
Framer.Extras.Hints.disable()

kaColors = require "kaColors"
utils = require "utils"
{TextLayer} = require "TextLayer"
RecorderUtility = require "recorder"

# Configuration, constants

enableAdditionExpressionForming = false
shouldReflowSecondAdditionArgument = true

enableBackgroundGrid = true
enableBlockGrid = true
enableDistinctColoringForOnesBlocks = true

layoutVertically = true
showSums = false

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
		if debugShowLensFrames
			this.borderColor = "red"
			this.borderWidth = 1
		
class BlockLens extends Lens
	this.blockSize = 40
	this.labelSpacing = 10
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
							
		this.style["-webkit-border-image"] = "url('images/ants.gif') 1 repeat repeat"
		
		this.labelOffset = 0
		this.labelBackground = new Layer
			parent: this
			backgroundColor: "rgba(255, 255, 255, 0.7)"
			borderRadius: 4
			height: 45
		
		this.tensLabel = new TextLayer
			parent: this
			fontFamily: "Helvetica"
			color: kaColors.math2
			autoSize: true
			fontSize: 36
			visible: false
			
		this.onesLabel = new TextLayer
			parent: this
			fontFamily: "Helvetica"
			color: kaColors.cs2
			autoSize: true
			fontSize: 36
			
		this.extraOnesLabel = new TextLayer
			parent: this
			fontFamily: "Helvetica"
			color: kaColors.cs2
			autoSize: true
			fontSize: 36
			
		this.plusLabel1 = new TextLayer
			parent: this
			fontFamily: "Helvetica"
			color: kaColors.gray68
			autoSize: true
			fontSize: 36
			text: "+"
			
		this.plusLabel2 = new TextLayer
			parent: this
			fontFamily: "Helvetica"
			color: kaColors.gray68
			autoSize: true
			fontSize: 36
			text: "+"
			
		this.equalsLabel = new TextLayer
			parent: this
			fontFamily: "Helvetica"
			color: kaColors.gray68
			autoSize: true
			fontSize: 36
			
		this.labels = [this.extraOnesLabel, this.plusLabel1, this.tensLabel, this.plusLabel2, this.onesLabel]
		this.animatableLabels = this.labels.concat this.equalsLabel, this.labelBackground
		
		this.wedge = new Wedge { parent: this }
		
		this.resizeHandle = new ResizeHandle {parent: this}
		
		this.reflowHandle = new ReflowHandle {parent: this, opacity: 0}
		if layoutVertically
			this.reflowHandle.midX = BlockLens.blockSize / 2 + 2
			this.reflowHandle.maxY = 0
		else
			this.reflowHandle.maxX = 0
			this.reflowHandle.midY = BlockLens.blockSize / 2 + 2
		
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
			this.setBeingTouched(true)

		this.on Events.TouchEnd, (event, layer) ->
			this.setBeingTouched(false)
			canvas.updateLabelOffsets this

		this.onTap (event, layer) =>
			event.stopPropagation()
			this.setSelected(true) unless this.draggable.isDragging
			
		this.update()
		this.resizeHandle.updatePosition false
		this.layoutReflowHandle false
		this.setSelected(false)
		
	update: (animated) ->
		this.style["-webkit-filter"] = switch this.layout.state 
			when "tentative", "tentativeReceiving"
				"drop-shadow(0px 0px 15px #{kaColors.math1})"
			else null
			
		lastRow = Math.ceil((this.value + this.layout.firstRowSkip) / this.layout.numberOfColumns)
		lastRowExtra = (this.value + this.layout.firstRowSkip) - (lastRow - 1) * this.layout.numberOfColumns
					
		for blockNumber in [0...this.value]
			blockLayer = this.blockLayers[blockNumber]
			indexForLayout = blockNumber + this.layout.firstRowSkip
			columnNumber = indexForLayout % this.layout.numberOfColumns
			rowNumber = Math.floor(indexForLayout / this.layout.numberOfColumns)
			newX = BlockLens.blockSize * if layoutVertically then rowNumber else columnNumber
			newY = BlockLens.blockSize * if layoutVertically then columnNumber else rowNumber
			if (this.layout.rowSplitIndex != null) and (rowNumber >= this.layout.rowSplitIndex)
				if layoutVertically
					newX += Wedge.splitY
				else
					newY += Wedge.splitY
			if animated
				blockLayer.animate {properties: {x: newX, y: newY}, time: 0.15}
			else
				blockLayer.props = {x: newX, y: newY}
				
			# Update the borders:
			heavyStrokeColor = kaColors.white
			setBorder = (side, heavy) ->
				if layoutVertically
					substitutionTable = {"left": "top", "top": "left", "right": "bottom", "bottom": "right"}
					side = substitutionTable[side]
				blockLayer.style["border-#{side}-color"] = if heavy then heavyStrokeColor else BlockLens.interiorBorderColor
				blockLayer.style["border-#{side}-width"] = if heavy then "2px" else "#{BlockLens.interiorBorderWidth}px"
			
			setBorder "left", columnNumber == 0 or blockNumber == 0
			setBorder "top", rowNumber == 0 or (rowNumber == 1 and columnNumber < this.layout.firstRowSkip)
			setBorder "bottom", rowNumber == (lastRow - 1) or (rowNumber == (lastRow - 2) and columnNumber >= lastRowExtra)
			setBorder "right", columnNumber == this.layout.numberOfColumns - 1 or (rowNumber == (lastRow - 1) and columnNumber == (lastRowExtra - 1))
			
			blockLayer.backgroundColor = if this.isBeingTouched then kaColors.math3 else kaColors.math1
			if enableDistinctColoringForOnesBlocks and ((rowNumber == (lastRow - 1) and lastRowExtra < this.layout.numberOfColumns) or (rowNumber == 0 and this.layout.firstRowSkip > 0))
				blockLayer.backgroundColor = if this.isBeingTouched then kaColors.cs3 else kaColors.cs1
				
		# Resize lens to fit blocks.
		contentFrame = this.contentFrame()
		this.width = BlockLens.blockSize * this.layout.numberOfColumns + 2
		this.height = BlockLens.blockSize * lastRow + 2
		if layoutVertically
			[this.width, this.height] = [this.height, this.width]
			
		this.resizeHandle.visible = (selection == this) and (this.layout.state != "tentativeReceiving")
		this.resizeHandle.updateSublayers()
		
		if not this.wedge.draggable.isDragging
			if layoutVertically
				this.wedge.y = this.height + Wedge.restingX
			else
				this.wedge.x = this.width + Wedge.restingX
			
		countOfBlocksInFullRows = (this.value - (lastRowExtra % this.layout.numberOfColumns) - (if this.layout.firstRowSkip > 0 then this.layout.numberOfColumns - this.layout.firstRowSkip else 0))
		countOfFullRows = countOfBlocksInFullRows / this.layout.numberOfColumns
		labelY = this.height + 20 + this.labelOffset * 50
		this.tensLabel.text = "#{countOfBlocksInFullRows}"
		if layoutVertically
			this.tensLabel.midX = (if this.layout.firstRowSkip > 0 then BlockLens.blockSize else 0) + BlockLens.blockSize * countOfFullRows/2
		else
			this.tensLabel.maxX = -20
			this.tensLabel.midY = if this.layout.firstRowSkip > 0 then 20 + BlockLens.blockSize else 20
		this.tensLabel.visible = countOfFullRows > 0
		
		this.onesLabel.text = "#{lastRowExtra}"
		if layoutVertically
			this.onesLabel.midX = this.width - BlockLens.blockSize / 2
		else
			this.onesLabel.maxX = if this.layout.numberOfColumns == 10 then -39 else -20
			this.onesLabel.midY = this.height - 20
		this.onesLabel.visible = lastRowExtra != this.layout.numberOfColumns
		
		this.extraOnesLabel.text = "#{this.layout.numberOfColumns - this.layout.firstRowSkip}"
		if layoutVertically
			this.extraOnesLabel.midX = BlockLens.blockSize / 2
		else
			this.extraOnesLabel.maxX = if this.layout.numberOfColumns == 10 then -39 else -20
			this.extraOnesLabel.midY = 20
		this.extraOnesLabel.visible = this.layout.firstRowSkip > 0
		
		numberOfVisibleLabels = this.tensLabel.visible + this.onesLabel.visible + this.extraOnesLabel.visible
		if layoutVertically
			this.plusLabel2.visible = numberOfVisibleLabels > 1
			this.plusLabel2.midX = ((if this.extraOnesLabel.visible then this.extraOnesLabel else this.tensLabel).maxX + (if (this.extraOnesLabel.visible and this.tensLabel.visible) then this.tensLabel else this.onesLabel).x) / 2
			this.plusLabel1.visible = numberOfVisibleLabels > 2
			this.plusLabel1.midX = (this.tensLabel.maxX + this.onesLabel.x) / 2
			
		# Make sure each label has room.
		labelWidths = this.labelWidths()
		if labelWidths > this.width
			this.labelBackground.width = labelWidths + 20
			margin = (this.width - labelWidths) / 2
			workingX = margin
			for label in this.labels
				continue unless label.visible
				label.x = workingX
				workingX += label.width + BlockLens.labelSpacing
		else
			this.labelBackground.width = this.width
				
		this.labelBackground.midX = this.width / 2
			
		this.equalsLabel.animate {properties: {y: labelY}, time: 0.15}
		this.equalsLabel.text = "= #{this.value}"
		this.equalsLabel.x = (if this.onesLabel.visible then this.onesLabel else this.tensLabel).maxX + 15
		this.equalsLabel.visible = showSums and (numberOfVisibleLabels > 1)
		
		if animated
			label.animate {properties: {y: labelY}, time: 0.2} for label in this.animatableLabels
		else
			label.y = labelY for label in this.animatableLabels	
				
					
	layoutReflowHandle: (animated) ->
# 		this.reflowHandle.animate
# 			properties:
# 				x: Math.max(-BlockLens.resizeHandleSize / 2, this.reflowHandle.x)
# 				y: (BlockLens.blockSize - BlockLens.resizeHandleSize) / 2
# 			time: if animated then 0.1 else 0
			
	setSelected: (isSelected) ->
		this.update()
		selectionBorderWidth = 1
		selection?.setSelected(false) if selection != this
		this.borderWidth = if isSelected then selectionBorderWidth else 0
		this.resizeHandle.visible = isSelected
		this.wedge.visible = isSelected
		
		if (isSelected and selection != this) or (not isSelected and selection == this)
			this.x += if isSelected then -selectionBorderWidth else selectionBorderWidth
			this.y += if isSelected then -selectionBorderWidth else selectionBorderWidth
			
		selection = if isSelected then this else null

		this.reflowHandle.ignoreEvents = not isSelected
		this.reflowHandle.animate { properties: {opacity: if isSelected then 1 else 0}, time: 0.15 }
		label.animate { properties: {opacity: if isSelected then 0 else 1}, time: 0.15 } for label in this.animatableLabels
	
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
			x: if layoutVertically then newBlockA.maxX + Wedge.splitY else this.x
			y: if layoutVertically then this.y else newBlockA.maxY + Wedge.splitY
			layout: this.layout
		
		this.destroy()
		
	labelWidths: ->
		output = 0
		output = -BlockLens.labelSpacing
		output += (label.width + BlockLens.labelSpacing) for label in this.labels when label.visible
		return output

canvas.updateLabelOffsets = (pivotBlock) ->
	pivotBlock.labelOffset = 0
	bounds = (block) ->
		width = Math.max(block.labelWidths(), block.width)
		return [block.midX - width/2 - 10, block.midX + width/2 + 10]
	[pivotMinX, pivotMaxX] = bounds(pivotBlock)
	for block in canvas.subLayers
		continue if block == pivotBlock
		continue unless Math.abs(block.maxY - pivotBlock.maxY) < BlockLens.blockSize*2
		continue unless (block instanceof BlockLens)
		[blockMinX, blockMaxX] = bounds(block)
		if (pivotMinX < blockMaxX) and (blockMinX < pivotMaxX)
			pivotBlock.labelOffset = Math.max(block.labelOffset + 1, pivotBlock.labelOffset)
	pivotBlock.update true

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
			backgroundColor: kaColors.math2
		if layoutVertically
			verticalBrace.width = BlockLens.blockSize
			verticalBrace.height = 5
			verticalBrace.midX = this.midX
			verticalBrace.maxY = this.maxY
		else
			verticalBrace.width = 5
			verticalBrace.height = BlockLens.blockSize
			verticalBrace.maxX = this.maxX
			verticalBrace.midY = this.midY
		
		horizontalBrace = new Layer
			parent: this
			backgroundColor: kaColors.math2
		if layoutVertically
			horizontalBrace.width = 2
			horizontalBrace.height = ReflowHandle.knobRightMargin + ReflowHandle.knobSize / 2
			horizontalBrace.midX = verticalBrace.midX
			horizontalBrace.maxY = verticalBrace.y
		else
			horizontalBrace.width = ReflowHandle.knobRightMargin + ReflowHandle.knobSize / 2
			horizontalBrace.height = 2
			horizontalBrace.maxX = verticalBrace.x
			horizontalBrace.midY = this.midY
		
		knob = new Layer
			parent: this
			backgroundColor: kaColors.math2
			width: ReflowHandle.knobSize
			height: ReflowHandle.knobSize
			borderRadius: ReflowHandle.knobSize / 2
		if layoutVertically
			knob.midY = horizontalBrace.y
			knob.midX = this.midX
		else
			knob.midX = horizontalBrace.x
			knob.midY = this.midY						
			
		verticalKnobTrack = new Layer
			parent: this
			opacity: 0
		if layoutVertically
			verticalKnobTrack.height = 2
			verticalKnobTrack.midY = knob.midY
		else
			verticalKnobTrack.width = 2
			verticalKnobTrack.midX = knob.midX
		verticalKnobTrack.sendToBack()
			
		updateVerticalKnobTrackGradient = =>
			fadeLength = 75
			trackLengthBeyondKnob = 200
			trackColor = kaColors.math2
			transparentTrackColor = "rgba(85, 209, 229, 0.0)"
			
			bottomFadeStartingHeight = trackLengthBeyondKnob + Math.abs(knob.midY) + trackLengthBeyondKnob - fadeLength
			if layoutVertically
				verticalKnobTrack.width = trackLengthBeyondKnob + Math.abs(knob.midX) + trackLengthBeyondKnob
				verticalKnobTrack.x = -trackLengthBeyondKnob + this.midX + Math.min(0, knob.midX)
			else
				verticalKnobTrack.height = trackLengthBeyondKnob + Math.abs(knob.midY) + trackLengthBeyondKnob
				verticalKnobTrack.y = -trackLengthBeyondKnob + this.midY + Math.min(0, knob.midY)
			verticalKnobTrack.style["-webkit-mask-image"] = "url(images/#{if layoutVertically then "dash-rotated" else "dash"}.png)"
			verticalKnobTrack.style.background = "-webkit-linear-gradient(#{if layoutVertically then "left" else "top"}, #{transparentTrackColor} 0%, #{trackColor} #{fadeLength}px, #{trackColor} #{bottomFadeStartingHeight}px, #{transparentTrackColor} 100%)"
			
		updateVerticalKnobTrackGradient()
		
		this.onTouchStart ->
			knob.animate { properties: {scale: 2}, time: 0.2 }
			verticalKnobTrack.animate { properties: {opacity: 1}, time: 0.2}
			
		this.onTouchEnd ->
			knob.animate { properties: {scale: 1}, time: 0.2 }
			verticalKnobTrack.animate { properties: {opacity: 0}, time: 0.2}
			
		this.onPan (event) ->
			if layoutVertically
				knob.x += event.delta.x
				this.y += event.delta.y
			else
				knob.y += event.delta.y
				this.x += event.delta.x
			updateVerticalKnobTrackGradient()
			
			this.parent.layout.firstRowSkip = utils.clip(Math.ceil((if layoutVertically then this.maxY else this.maxX) / BlockLens.blockSize), 0, this.parent.layout.numberOfColumns - 1)
			this.parent.update()

			event.stopPropagation()
			
		this.onPanEnd =>
			isAnimating = true
			knobAnimation = knob.animate
				properties: if layoutVertically then {midX: this.width / 2} else {midY: this.height / 2},
				time: 0.2
			knobAnimation.on Events.AnimationEnd, ->
				isAnimating = false
				
			updateVerticalTrackForAnimation = ->
				return unless isAnimating
				updateVerticalKnobTrackGradient()
				requestAnimationFrame updateVerticalTrackForAnimation
			requestAnimationFrame updateVerticalTrackForAnimation
			
			this.animate
				properties: if layoutVertically then { maxY: BlockLens.blockSize * this.parent.layout.firstRowSkip } else { maxX: BlockLens.blockSize * this.parent.layout.firstRowSkip }
				time: 0.2
			
			event.stopPropagation()
			
class ResizeHandle extends Layer
	this.knobSize = 30
	# This is kinda complicated... because we don't want touches on the resize handle to conflict with touches on the blocks themselves, we make it easier to "miss" the resize handle down and to the right of its actual position than up or to the left.
	this.knobHitTestBias = 10

	constructor: (args) ->
		throw "Requires parent layer" if args.parent == null
		
		super args
		knobSize = 88
		this.props =
			backgroundColor: ""
		if layoutVertically
			this.height = knobSize
		else
			this.width = knobSize
		
		knob = new Layer
			parent: this
			backgroundColor: ""
			width: knobSize
			height: knobSize
		this.knob = knob
		if layoutVertically
			this.knob.midY = this.midY + ResizeHandle.knobHitTestBias
		else
			this.knob.midX = this.midX + ResizeHandle.knobHitTestBias
		
		knobDot = new Layer
			parent: knob
			backgroundColor: kaColors.math2
			width: ResizeHandle.knobSize
			height: ResizeHandle.knobSize
			borderRadius: ResizeHandle.knobSize / 2
			midX: knob.width / 2 - ResizeHandle.knobHitTestBias
			midY: knob.height / 2 - ResizeHandle.knobHitTestBias
			
		this.verticalBrace = new Layer
			parent: this
			backgroundColor: kaColors.math2
		if layoutVertically
			this.verticalBrace.height = 5
			this.verticalBrace.midY = this.midY
		else
			this.verticalBrace.width = 5
			this.verticalBrace.midX = this.midX
			
		verticalKnobTrack = new Layer
			parent: this
			opacity: 0
		if layoutVertically
			verticalKnobTrack.height = 2
			verticalKnobTrack.midY = this.midY
		else
			verticalKnobTrack.width = 2
			verticalKnobTrack.midX = this.midX
		verticalKnobTrack.sendToBack()
			
		this.updateVerticalKnobTrackGradient = =>
			fadeLength = 150
			trackLengthBeyondKnob = 250
			trackColor = kaColors.math2
			transparentTrackColor = "rgba(85, 209, 229, 0.0)"
			
			bottomFadeStartingHeight = if layoutVertically then knob.midX - this.verticalBrace.maxX else knob.midY - this.verticalBrace.maxY
			if layoutVertically
				verticalKnobTrack.width = knob.midX - this.verticalBrace.maxX + trackLengthBeyondKnob
				verticalKnobTrack.x = this.verticalBrace.maxX
			else
				verticalKnobTrack.height = knob.midY - this.verticalBrace.maxY + trackLengthBeyondKnob
				verticalKnobTrack.y = this.verticalBrace.maxY
			verticalKnobTrack.style["-webkit-mask-image"] = "url(images/#{if layoutVertically then "dash-rotated" else "dash"}.png)"
			verticalKnobTrack.style.background = "-webkit-linear-gradient(#{if layoutVertically then "left" else "top"}, #{trackColor} 0%, #{trackColor} #{bottomFadeStartingHeight}px, #{transparentTrackColor} 100%)"
			
		this.updateVerticalKnobTrackGradient()
		
		this.knob.onTouchStart =>
			this.isDragging = true
			this.parent.update()
			knobDot.animate { properties: { scale: 2 }, time: 0.2 }
			verticalKnobTrack.animate { properties: { opacity: 1 }, time: 0.2}
			
			# This is pretty hacky, even for a prototype. Eh.
			this.parent.wedge.animate { properties: { opacity: 0 }, time: 0.2 }
			this.parent.reflowHandle.animate { properties: {opacity: 0}, time: 0.15 }
			label.animate { properties: {opacity: 1}, time: 0.15 } for label in this.parent.animatableLabels
			
		this.knob.onTouchEnd =>
			knobDot.animate { properties: { scale: 1 }, time: 0.2 }
			verticalKnobTrack.animate { properties: { opacity: 0 }, time: 0.2}
			this.parent.wedge.animate { properties: { opacity: 1 }, time: 0.4, delay: 0.4 }
			this.parent.reflowHandle.animate { properties: {opacity: 1}, time: 0.15 }
			label.animate { properties: {opacity: 0}, time: 0.15 } for label in this.parent.animatableLabels
			setTimeout(=>
				this.isDragging = false
			, 100)
		
		this.knob.onPan (event) =>
			value = null
			if layoutVertically
				knob.x += event.delta.x
				this.y += event.delta.y
				value = (this.y + this.verticalBrace.y)
			else
				knob.y += event.delta.y
				this.x += event.delta.x
				value = (this.x + this.verticalBrace.x)
			this.updateVerticalKnobTrackGradient()
			
			this.parent.layout.numberOfColumns = Math.max(1, Math.floor(value / BlockLens.blockSize))
			this.parent.update()
			
			event.stopPropagation()
			
		this.knob.onPanEnd =>			
			this.updatePosition true
			event.stopPropagation()
			
	updateSublayers: ->
		if layoutVertically
			this.verticalBrace.x = 0
			this.verticalBrace.width = this.parent.width - this.x
			this.width = this.knob.maxX
		else
			this.verticalBrace.y = 0
			this.verticalBrace.height = this.parent.height - this.y
			this.height = this.knob.maxY
		
	updatePosition: (animated) ->
		if layoutVertically
			this.x = 2
		else
			this.y = 2
		this.animate
			properties: if layoutVertically then { midY: BlockLens.blockSize * this.parent.layout.numberOfColumns + 2 } else { midX: BlockLens.blockSize * this.parent.layout.numberOfColumns + 2 }
			time: if animated then 0.2 else 0
			
		isAnimating = true
		knobAnimation = this.knob.animate
			properties: if layoutVertically then { midX: this.parent.width - this.x + ResizeHandle.knobHitTestBias } else { midY: this.parent.height - this.y + ResizeHandle.knobHitTestBias }
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
			image: "images/triangle#{if layoutVertically then "-rotated" else ""}@2x.png"
			width: if layoutVertically then 40 else 80
			height: if layoutVertically then 80 else 40
			backgroundColor: ""
			
		this.draggable.enabled = true
		this.draggable.momentum = false
		this.draggable.propagateEvents = false
		
		this.draggable.on Events.DragMove, (event) =>
			intoBlocks = if layoutVertically then this.minY else this.minX
			alongBlocks = if layoutVertically then this.midX else this.midY
			threshold = if layoutVertically then this.parent.height else this.parent.width
			this.parent.layout.rowSplitIndex = if intoBlocks <= threshold
				Math.round(alongBlocks / BlockLens.blockSize)
			else
				null
			this.parent.update(true)
			
		this.draggable.on Events.DragEnd, (event) =>
			if (this.minX <= this.parent.width) and (this.parent.layout.rowSplitIndex > 0) and (this.parent.layout.rowSplitIndex <= Math.floor(this.parent.value / this.parent.layout.numberOfColumns))
				this.parent.splitAt(this.parent.layout.rowSplitIndex)
			else
				this.animate
					properties: if layoutVertically then { y: this.parent.height + Wedge.restingX, x: 0 } else { x: this.parent.width + Wedge.restingX, y: 0 }
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
	
	tens = if layoutVertically then event.point.x - event.start.x else event.point.y - event.start.y
	ones = if layoutVertically then event.point.y - event.start.y else event.point.x - event.start.x
	value = 10 * Math.max(0, Math.floor(tens / BlockLens.blockSize)) + utils.clip(Math.ceil(ones / BlockLens.blockSize), 0, 10)
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
	pendingBlockToAddLabel.midX = startingLocation.x + pendingBlockToAdd.width / 2
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
		)
		this.relevantLayerGetter = relevantLayerGetter
	
	clear: =>
		this.recordedEvents = []
		this.recorder?.clear()
		
	startPlaying: =>
		return if this.isRecording or this.isPlayingBackRecording
		
		this.basePlaybackTime = window.performance.now()
		this.lastAppliedTime = -1
		this.isPlayingBackRecording = true
		this.play this.basePlaybackTime
		
		this.playingLayer = new TextLayer
			parent: rootLayer
			x: Align.left(40)
			y: Align.bottom(-53)
			fontSize: 32
			autoSize: true
			color: kaColors.cs1
			text: "Playing…"
		
		return unless this.recorder
		this.recorder.getBuffer (buffers) =>
			newSource = this.audioContext.createBufferSource()
			newBuffer = this.audioContext.createBuffer 2, buffers[0].length, this.audioContext.sampleRate
			newBuffer.getChannelData(0).set buffers[0]
			newBuffer.getChannelData(1).set buffers[1]
			newSource.buffer = newBuffer
			newSource.connect this.audioContext.destination
			newSource.start 0

	play: (timestamp) =>
		shouldStop = false
		# Find the relevant event...
		for event in this.recordedEvents by -1
			# We'll play the soonest event we haven't already played.
			if event.time <= (timestamp - this.basePlaybackTime) and event.time > this.lastAppliedTime
				relevantLayers = this.relevantLayerGetter()
				# Found it! Apply each layer's record:
				for layerID, layerRecord of event.layerRecords
					# Find the live layer layer that corresponds to this.
					layerIDNumber = parseInt(layerID) # lol javascript
					layer = relevantLayers.find (testLayer) ->
						return testLayer.id == layerIDNumber
					layer.style.cssText = layerRecord
					
				this.lastAppliedTime = event.time
				
				if event == this.recordedEvents[this.recordedEvents.length - 1]
					this.isPlayingBackRecording = false
					this.playingLayer.destroy()
					return
				else
					break
		requestAnimationFrame this.play
					
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
		
	record: (timestamp) =>
		return unless this.isRecording
		
		layerRecords = {}
		layerRecordCount = 0
		for layer in this.relevantLayerGetter()
			continue if layer.skipRecording
			
			# Find the last time this layer appeared in our recording.
			lastLayerRecord = null
			for recordedEvent in this.recordedEvents by -1
				lastLayerRecord = recordedEvent.layerRecords[layer.id]
				break if lastLayerRecord
				
			style = layer.style.cssText
			if lastLayerRecord != style
				layerRecords[layer.id] = style
				layerRecordCount += 1
				
		if layerRecordCount > 0
			event = 
				time: timestamp - this.baseRecordingTime
				layerRecords: layerRecords
			this.recordedEvents.push event
			
		requestAnimationFrame this.record

recorder = new Recorder ->
	result = canvas.descendants
	result.push(canvas)
	return result

# Setup

startingOffset = 40 * 60
setup = ->
	testBlock = new BlockLens
		value: 37
		parent: canvas
		x: 120
		y: 200
		
	testBlock2 = new BlockLens
		value: 15
		parent: canvas
		x: 400
		y: 200

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