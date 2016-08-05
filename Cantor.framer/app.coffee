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

debugShowLensFrames = false

# Canvas

selection = null
canvas = new Layer
	backgroundColor: ""
	width: Screen.width
	height: Screen.height
canvas.onTap (event, layer) ->
	selection?.setSelected(false)

if enableBackgroundGrid
	grid = new BackgroundLayer {parent: canvas}
	grid.style["background"] = "url('images/grid.svg')"

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
			args.layout
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
			
		this.reflowHandle = new Layer
			parent: this
			width: BlockLens.resizeHandleSize
			height: BlockLens.resizeHandleSize
			borderRadius: BlockLens.resizeHandleSize / 2.0
			borderColor: kaColors.math2
			borderWidth: 6
			backgroundColor: ""
			x: -BlockLens.resizeHandleSize / 2.0
			
		this.reflowHandle.draggable.enabled = true
		this.reflowHandle.draggable.momentum = false
		this.reflowHandle.draggable.vertical = false
		this.reflowHandle.draggable.constraints = {x: -BlockLens.resizeHandleSize / 2, y: 0, width: BlockLens.blockSize * 10 + BlockLens.resizeHandleSize / 2, height: 0}
		this.reflowHandle.draggable.overdrag = false
		this.reflowHandle.draggable.propagateEvents = false
		this.reflowHandle.on Events.DragMove, =>
			startPoint = this.reflowHandle.draggable.layerStartPoint 
			offset = this.reflowHandle.draggable.offset
			this.layout.firstRowSkip = utils.clip(Math.round((startPoint.x + offset.x) / BlockLens.blockSize), 0, 9)
			this.update()
		this.reflowHandle.on Events.DragEnd, =>
			this.layoutReflowHandle true
		
		this.draggable.enabled = true
		this.draggable.momentum = false
		
		this.originalLayout = this.layout
		this.operationLabel = null
		
		this.draggable.on Events.DragStart, =>
			this.originalLayout = this.layout
			
			if not this.operationLabel
				this.operationLabel = new OperationLabel {opacity: 0}
				this.operationLabel.operandB = this
				
			this.bringToFront()
		
		this.draggable.on Events.DragMove, (event) =>
			return if not enableAdditionExpressionForming
		
			intersectsWithRange = (otherLayer) =>
				nearFrame = Utils.frameInset(otherLayer.frame, -80)
				return utils.framesIntersect(this.frame, nearFrame)
		
			if this.draggable.otherLayer
				if not intersectsWithRange(this.draggable.otherLayer)
					this.draggable.otherLayer.layout.state = "static"
					this.draggable.otherLayer.update()
					this.draggable.otherLayer = null
					
					this.layout.numberOfColumns = this.originalLayout.numberOfColumns
					this.layout.firstRowSkip = 0
					this.update(true)
					
					this.operationLabel.animate {properties: {opacity: 0}, time: 0.2}
					
			if not this.draggable.otherLayer
				# TODO: Better method of finding siblings
				for otherLayer in this.siblings
					continue if otherLayer == this
					continue if not (otherLayer instanceof BlockLens)
					
					if intersectsWithRange(otherLayer)
						this.draggable.otherLayer = otherLayer
						this.operationLabel.operandA = otherLayer
						
						this.layout = 
							state: "tentative"
							firstRowSkip: if shouldReflowSecondAdditionArgument then otherLayer.value % otherLayer.layout.numberOfColumns else 0
							numberOfColumns: otherLayer.layout.numberOfColumns
						this.update(true)
						
						otherLayer.layout.state = "tentativeReceiving"
						otherLayer.update()
						
						this.operationLabel.animate {properties: {opacity: 1}, time: 0.2}
						break
						
			if this.draggable.otherLayer
				this.operationLabel.x = Math.min(this.x, this.draggable.otherLayer.x) - 110
				this.operationLabel.y = (this.y + this.draggable.otherLayer.y) / 2
		
		this.draggable.on Events.DragEnd, (event) =>
			this.animate
				properties:
					x: Math.round(this.x / BlockLens.blockSize) * BlockLens.blockSize
					y: Math.round(this.y / BlockLens.blockSize) * BlockLens.blockSize
				time: 0.2
		
			this.draggable.otherLayer?.layout.state = "static"
			this.draggable.otherLayer?.update()
	
			if this.draggable.otherLayer
				finalX = this.draggable.otherLayer.x
				finalY = this.draggable.otherLayer.y + 70
				this.animate {properties: {x: finalX, y: finalY}, time: 0.2}
				this.operationLabel.animate
					properties:
						x: Math.min(finalX, this.draggable.otherLayer.x) - 110
						y: (finalY + this.draggable.otherLayer.y) / 2
					time: 0.2
					
				this.layout.state = "static"
				this.draggable.otherLayer = null
			else
				this.operationLabel.animate {properties: {opacity: 0}, time: 0.2}
				this.layout = this.originalLayout
				
			this.update(true)
			
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
				blockLayer.style["border-#{side}-width"] = if heavy then "2px" else BlockLens.interiorBorderWidth
			
			lastRow = Math.ceil((this.value + this.layout.firstRowSkip) / this.layout.numberOfColumns)
			lastRowExtra = (this.value + this.layout.firstRowSkip) - (lastRow - 1) * this.layout.numberOfColumns
			setBorder "left", columnNumber == 0 or blockNumber == 0
			setBorder "top", rowNumber == 0 or (rowNumber == 1 and columnNumber < this.layout.firstRowSkip)
			setBorder "bottom", rowNumber == (lastRow - 1) or (rowNumber == (lastRow - 2) and columnNumber >= lastRowExtra)
			setBorder "right", columnNumber == this.layout.numberOfColumns - 1 or (rowNumber == (lastRow - 1) and columnNumber == (lastRowExtra - 1))
				
		# Resize lens to fit blocks.
		contentFrame = this.contentFrame()
		this.width = BlockLens.blockSize * this.layout.numberOfColumns
		this.height = this.blockLayers[this.value - 1].maxY

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
		this.reflowHandle.animate
			properties:
				x: Math.max(-BlockLens.resizeHandleSize / 2, this.reflowHandle.x)
				y: (BlockLens.blockSize - BlockLens.resizeHandleSize) / 2
			time: if animated then 0.1 else 0
			
	setSelected: (isSelected) ->
		selection?.setSelected(false) if selection != this
		this.borderWidth = if isSelected then 1 else 0
		this.resizeHandle.visible = isSelected
		this.reflowHandle.visible = isSelected
		this.wedge.visible = isSelected
		selection = this if isSelected

class OperationLabel extends Layer
	this.size = 50
	
	constructor: (args) ->
		super args
		this.props =
			borderColor: kaColors.math1
			borderWidth: 2
			borderRadius: OperationLabel.size / 2
			width: OperationLabel.size
			height: OperationLabel.size
			backgroundColor: ""
			color: kaColors.math1
		this.html = "<p style='text-align: center; margin-top: 5px; font-family: Helvetica; font-size: 40px'>+</p>"
		
		this.draggable.enabled = true
		this.draggable.momentum = false
		this.draggable.on Events.DragMove, (event) =>
			this.operandA.x += event.delta.x
			this.operandA.y += event.delta.y
			this.operandB.x += event.delta.x
			this.operandB.y += event.delta.y
			
		this.on Events.TouchStart, (event) =>
			this.operandA.layout.state = "tentativeReceiving"
			this.operandA.update()
			this.operandB.layout.state = "tentative"
			this.operandB.update()
			
		this.on Events.TouchEnd, (event) =>
			this.operandA.layout.state = "static"
			this.operandA.update()
			this.operandB.layout.state = "static"
			this.operandB.update()	

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
				newValueA = Math.min(this.parent.layout.rowSplitIndex * this.parent.layout.numberOfColumns - this.parent.layout.firstRowSkip, this.parent.value)
				newValueB = this.parent.value - newValueA
				
				this.parent.layout.rowSplitIndex = null
				
				newBlockA = new BlockLens
					value: newValueA
					parent: this.parent.parent
					x: this.parent.x
					y: this.parent.y
					layout: this.parent.layout
				
				newBlockB = new BlockLens
					value: newValueB
					parent: this.parent.parent
					x: this.parent.x
					y: newBlockA.maxY + Wedge.splitY
					layout: this.parent.layout
				newBlockB.layout.firstRowSkip = 0
				newBlockB.update()
				
				this.parent.destroy()
			else
				this.animate { properties: { x: this.parent.width + Wedge.restingX }, time: 0.2 }
			
		this.onTap (event) -> event.stopPropagation()

# Setup

testBlock = new BlockLens
	value: 18
	parent: canvas
	x: 200
	y: 80
	
testBlock2 = new BlockLens
	value: 35
	parent: canvas
	x: 200
	y: 280

testBlock2 = new BlockLens
	value: 82
	parent: canvas
	x: 200
	y: 600
