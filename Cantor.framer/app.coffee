kaColors = require "kaColors"
utils = require "utils"
Screen.backgroundColor = "white"

# Configuration, constants

debugShowLensFrames = false
shouldReflowSecondArgument = true

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
	this.resizeHandleSize = 30
		
	constructor: (args) ->
		super args
		
		this.layout =
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
				borderColor: kaColors.math2
				borderWidth: 1
			this.blockLayers.push block
				
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
		this.resizeHandle.draggable.constraints = {x: BlockLens.blockSize, y: 0, width: BlockLens.blockSize * 10 - BlockLens.resizeHandleSize / 2, height: this.value * BlockLens.blockSize}
		this.resizeHandle.draggable.overdrag = false
		this.resizeHandle.draggable.propagateEvents = false
		this.resizeHandle.on Events.DragMove, =>
			startPoint = this.resizeHandle.draggable.layerStartPoint 
			offset = this.resizeHandle.draggable.offset
			this.layout.numberOfColumns = Math.round((startPoint.x + offset.x) / BlockLens.blockSize)
			this.update()
		this.resizeHandle.on Events.DragEnd, =>
			this.layoutResizeHandle true
		
		this.update()
		this.layoutResizeHandle false
		
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
							firstRowSkip: if shouldReflowSecondArgument then otherLayer.value % otherLayer.layout.numberOfColumns else 0
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
		
	update: (animated) ->
		this.style["-webkit-filter"] = switch this.layout.state 
			when "tentative", "tentativeReceiving"
				"drop-shadow(0px 0px 15px #{kaColors.math1})"
			else null
					
		for blockNumber in [0...this.value]
			blockLayer = this.blockLayers[blockNumber]
			indexForLayout = blockNumber + this.layout.firstRowSkip
			newX = BlockLens.blockSize * (indexForLayout % this.layout.numberOfColumns)
			newY = BlockLens.blockSize * Math.floor(indexForLayout / this.layout.numberOfColumns)
			if animated
				blockLayer.animate {properties: {x: newX, y: newY}, time: 0.15, delay: 0.008 * blockNumber}
			else
				blockLayer.props = {x: newX, y: newY}
		
		this.onesTick.visible = Math.min(this.value, this.layout.numberOfColumns) >= 5
		
		# Resize lens to fit blocks.
		contentFrame = this.contentFrame()
		this.width = BlockLens.blockSize * utils.clip(this.value, 1, this.layout.numberOfColumns)
		this.height = this.blockLayers[this.value - 1].maxY

		this.onesTick.height = Math.ceil(this.value / this.layoutnumberOfColumns) * BlockLens.blockSize
		
		this.resizeHandle.visible = this.layout.state != "tentativeReceiving"

	layoutResizeHandle: (animated) ->
		this.resizeHandle.animate
			properties:
				x: this.width - BlockLens.resizeHandleSize / 2
				y: this.height - BlockLens.resizeHandleSize / 2
			time: if animated then 0.1 else 0	

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

testBlock = new BlockLens
	value: 8
	x: 150
	y: 50
	
testBlock2 = new BlockLens
	value: 15
	x: 150
	y: 300

