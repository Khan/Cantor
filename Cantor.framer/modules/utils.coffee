exports.clip = (value, min, max) ->
	return Math.max(min, Math.min(max, value))

exports.pointInsideLayer = (layer, point) ->
	return layer.x <= point.x && layer.maxX > point.x && layer.y <= point.y && layer.maxY > point.y

exports.layersIntersect = (layerA, layerB) ->
	x = Math.max(layerA.x, layerB.x)
	y = Math.max(layerA.y, layerB.y)
	maxX = Math.min(layerA.maxX, layerB.maxX)
	maxY = Math.min(layerA.maxY, layerB.maxY)
	return maxX >= x && maxY >= y

exports.framesIntersect = (frameA, frameB) ->
	x = Math.max(frameA.x, frameB.x)
	y = Math.max(frameA.y, frameB.y)
	maxX = Math.min(frameA.x + frameA.width, frameB.x + frameB.width)
	maxY = Math.min(frameA.y + frameA.height, frameB.y + frameB.height)
	return maxX >= x && maxY >= y
