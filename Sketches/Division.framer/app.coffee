# Project Info
# This info is presented in a widget when you share.
# http://framerjs.com/docs/#info.info

Framer.Info =
	title: ""
	author: "Andy Matuschak"
	twitter: ""
	description: ""


kaColors = require "kaColors"

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
	line = createLine()
	lines.push(line)
	line.sendToBack()

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

highlightLine = createLine()
highlightLine.shadowColor = kaColors.math2
highlightLine.shadowSpread = 2

highlightBlock = new Layer
	backgroundColor: kaColors.math2
	x: 120
	y: 120
	width: size * (value / division)
	height: size 
	opacity: 0.0
highlightBlock.style["mix-blend-mode"] = "screen"

divisionBlock = new Layer
	x: 120
	y: 200
	width: size * division
	height: size
	backgroundColor: kaColors.cs1
divisionBlock.style["mix-blend-mode"] = "screen"

divisionBlock.onPan (event) =>
	divisionBlock.width += event.deltaX
	division = divisionBlock.width / size
	highlightBlock.width = size * (value / division)
	
	moveLine(highlightLine, block.x + 3, block.y + size, block.x + size*value/division, block.y + size)
	
	for i in [0...lines.length]
		if i < Math.ceil(division)
			moveLine(lines[i], divisionBlock.x + size*i + 2, divisionBlock.y + 2, block.x + (value / division) * size * i + 2, block.y + size)
			lines[i].visible = true
		else if i == Math.ceil(division)
			maxX = if division >= 1
				maxX = block.maxX
			else
				maxX = block.x + (value / division) * size
			moveLine(lines[i], divisionBlock.x + size*(division) + 2, divisionBlock.y + 2, maxX, block.y + size)
			lines[i].visible = true
		else
			lines[i].visible = false