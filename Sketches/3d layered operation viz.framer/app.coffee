# Visualizing 10 - 4 + 7 by separating into several layers on drag.

kaColors = require "kaColors"

Screen.backgroundColor = "white"

blockSize = 50

root = new Layer
	size: Screen.size
	backgroundColor: ""
	perspective: 100
	
blockParent = new Layer
	y: 300
	width: 500
	height: 100
	parent: root
	backgroundColor: ""
	x: 125

blockParent.draggable.enabled = true
blockParent.draggable.horizontal = false
blockParent.draggable.momentum = false

makeBlock = ->
	new Layer
		width: blockSize
		parent: blockParent
		height: blockSize
		backgroundColor: kaColors.math1
		borderColor: kaColors.math2
		borderWidth: 1
		
zSpacing = 3
		
first = []
for i in [0...10]
	block = makeBlock()
	block.x = i * blockSize
	block.y = 0
	first.push(block)
	
second = []
for i in [0...4]
	block = makeBlock()
	block.x = i * blockSize + 6 * blockSize
	block.y = 0
	block.backgroundColor = "white"
	block.style["border"] = "1px dashed gray"
	second.push(block)
	
third = []
thirdAux = []
for i in [0...4]
	block = makeBlock()
	block.x = i * blockSize + 6 * blockSize
	block.y = 0
	block.backgroundColor = "rgba(25, 156, 194, 1.0)";
	third.push(block)
		
for i in [0...3]
	block = makeBlock()
	block.x = i * blockSize
	block.y = blockSize
	block.backgroundColor = "rgba(25, 156, 194, 1.0)";
	third.push(block)
	
	block = makeBlock()
	block.x = i * blockSize
	block.y = blockSize
	block.opacity = 0
	block.backgroundColor = kaColors.cs1
	block.borderWidth = 0
	thirdAux.push(block)
	


# state = false
root.onTouchStart ->
	for block in second
		block.animate
			properties: {z: zSpacing}
			time: 0.2
	for block in third
		block.animate
			properties:
				z: zSpacing * 2
				backgroundColor: "rgba(32, 159, 67, 0.8)"
				borderColor: "rgba(100, 201, 93, 1.0)"
			time: 0.2
	for block in thirdAux
		block.animate
			properties: {opacity: 0.4}
			time: 0.2


root.onTouchEnd ->
	for block in second
		block.animate
			properties: {z: 0}
			time: 0.2
	for block in third
		block.animate
			properties: 
				z: 0
				backgroundColor: kaColors.math1
				borderColor: kaColors.math2
			time: 0.2
	for block in thirdAux
		block.animate
			properties: {opacity: 0}
			time: 0.2