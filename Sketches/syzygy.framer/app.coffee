# hacks hacks hacks and vineyards

kaColors = require "kaColors"

Screen.backgroundColor = "white"

blockSize = 50

root = new Layer
	size: Screen.size
	backgroundColor: ""
	perspective: 400
	
blockParent = new Layer
	x: 0
	y: 1000
	width: Screen.width
	height: Screen.height * 2
	parent: root
	backgroundColor: ""

blockParent.draggable.enabled = true
blockParent.draggable.momentum = false

makeBlock = ->
	new Layer
		width: 15
		parent: blockParent
		height: 100
		backgroundColor: kaColors.cs1
		borderColor: kaColors.cs2
		borderWidth: 1

xSpacing = 60
zSpacing = 50
numRows = 20
numColumns = 30

elements = []
for z in [0...numRows]
	for i in [0...numColumns]
		element = makeBlock()
		elements.push(element)
		
layout = ->
	c = 0
	for z in [0...numRows]
		for i in [0...numColumns]
			e = elements[c]
			e.x = i * xSpacing - (numColumns / 2 * xSpacing) + Screen.width / 2
			e.z = z * -zSpacing
			c += 1
			
root.onPan (event) ->
	if event.start.y < 700
		xSpacing += event.delta.x * 0.1
		zSpacing += event.delta.y * 0.1
		layout()
			
layout()

bottomLabel = new Layer
	y: Screen.height - 135
	width: Screen.width
	height: 200
	backgroundColor: ""
	color: kaColors.gray41
	z: -1
bottomLabel.html = "<p style='text-align: center'>Drag here to move the camera</p>"

topLabel = bottomLabel.copy()
topLabel.y = 50
topLabel.html = "<p style='text-align: center'>Drag here to change vineyard spacing</p>"