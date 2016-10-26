# Project Info
# This info is presented in a widget when you share.
# http://framerjs.com/docs/#info.info

Framer.Info =
	title: ""
	author: "Andy Matuschak"
	twitter: ""
	description: ""


kaColors = require "kaColors"

Canvas.backgroundColor = "white"

grid = new Layer
	width: Screen.width * 10
	height: Screen.height * 10
grid.style["background"] = "url('images/#{"grid.svg"}')"

createLine = ->
	line = new Layer
		height: 0
		width: 100
		originX: 0
		originY: 0
	
	# Use Shadow to create centered line
	line.shadowSpread = 1	# line size
	line.shadowColor = "#ccc"
	return line

lines = []
for i in [0..10]
	lines.push(createLine())



size = 40
value = 8
division = 2

moveLine = (targetLayer, x1, y1, x2, y2) ->
	
	# Set Position
	targetLayer.x = x1
	targetLayer.y = y1
	
	# Set "length"
	dist = calcDistance(x1, y1, x2, y2)
	targetLayer.width = dist
	
	# Sorry for bad math
	angle = calcAngle(x1, y1, x2, y2)
	targetLayer.rotation = -angle-90 

# Math Helper Functions

calcDistance = (p1x, p1y, p2x, p2y) ->
  [a, b] = [p1x - p2x, p1y - p2y]
  Math.sqrt Math.pow(a, 2) + Math.pow(b, 2)
  
class Point
  constructor: (@x, @y) ->
  draw: (ctx) -> ctx.fillRect @x, @y, 1, 1
  toString: -> "(#{@x}, #{@y})"
  
calcAngle = (p1x,p1y,p2x,p2y) ->	
	angle = Math.atan2(p2x - p1x, p2y - p1y) * 180 / Math.PI + 180
	return angle

block = new Layer
	backgroundColor: kaColors.math1
	x: 120
	y: 120
	width: size * value
	height: size 
	opacity: 1.0
block.style["mix-blend-mode"] = "screen"

highlightBlock = new Layer
	backgroundColor: kaColors.math2
	x: 120
	y: 120
	width: size * (value / division)
	height: size 
	opacity: 0.5
highlightBlock.style["mix-blend-mode"] = "screen"

divisionBlock = new Layer
	x: 120
	y: 200
	width: size * division
	height: size
	backgroundColor: kaColors.cs1
divisionBlock.style["mix-blend-mode"] = "screen"


update = ->
	value = block.width / size
	division = divisionBlock.width / size
	highlightBlock.width = size * (value / division)

	for i in [0...lines.length]
		if i < Math.ceil(division)
			moveLine(lines[i], divisionBlock.x + size*i + 2, divisionBlock.y, block.x + (value / division) * size * i + 2, block.y + size)
			lines[i].visible = true
		else if i == Math.ceil(division)
			maxX = if division >= 1
				maxX = block.maxX
			else
				maxX = block.x + (value / division) * size
			moveLine(lines[i], divisionBlock.x + size*(division), divisionBlock.y, maxX, block.y + size)
			lines[i].visible = true
		else
			lines[i].visible = false
			
	verticalLine.midX = Math.max(block.maxX, divisionBlock.maxX)
	knob.midX = verticalLine.midX

blockResizeStart = (block) ->
	(event) -> block.originalWidth = block.width	
	
blockResizeUpdate = (block) ->
	(event) ->
		block.width = Math.max(size, block.originalWidth + Math.round(event.offset.x / size) * size)
		update()

	
divisionBlock.onPanStart blockResizeStart(divisionBlock)
divisionBlock.onPan blockResizeUpdate(divisionBlock)

block.onPanStart blockResizeStart(block)
block.onPan blockResizeUpdate(block)
	
verticalLine = new Layer
	backgroundColor: kaColors.math2
	width: 2
	height: size * 3
	y: block.y
	
knob = new Layer
	backgroundColor: kaColors.math2
	width: 15
	height: 15
	borderRadius: "50%"
	midY: verticalLine.midY
	
grid.onPanStart ->
	block.originalWidth = block.width
	divisionBlock.originalWidth = divisionBlock.width
grid.onPan (event) ->
	knob.x += event.delta.x
	verticalLine.midX = knob.midX
	biggerBlock = if block.width > divisionBlock.width then block else divisionBlock
	smallerBlock = if biggerBlock == block then divisionBlock else block
	biggerBlock.width = knob.midX - biggerBlock.x
	smallerBlock.width = smallerBlock.originalWidth * biggerBlock.width / biggerBlock.originalWidth
	update()
	
update()