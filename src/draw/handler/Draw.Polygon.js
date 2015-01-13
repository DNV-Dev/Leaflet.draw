L.Draw.Polygon = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'polygon'
	},

	Poly: L.Polygon,

	options: {
		showArea: false,
		showPerimeter: false,
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		}
	},

	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Polygon.TYPE;
	},
	
	disable: function() {
		this._isGuideVisible = true;
		L.Draw.Polyline.prototype.disable.call(this);
	},

	_onMouseMove : function (e) {
		var latlng = e.latlng,
		latlngCount = this._poly.getLatLngs().length;

		if (latlngCount === 2) {
			this._isGuideVisible = false;
			this.addVertex(latlng);
		} else if (latlngCount > 2) {
			this._poly.spliceLatLngs(latlngCount - 1, 1, latlng)[0];
			this._calculatePolygonMeasurements();
		}
		
		L.Draw.Polyline.prototype._onMouseMove.call(this, e);
	},

	_finishShape: function() {
		this.deleteLastVertex();
		this._isGuideVisible = true;
		L.Draw.Polyline.prototype._finishShape.call(this);
	},

	_updateFinishHandler: function () {
		var markerCount = this._markers.length;
		// The first marker should have a click handler to close the polygon
		if (markerCount === 1) {
			this._markers[0].on('click', this._finishShape, this);
		}
	},

	_calculatePolygonMeasurements: function() {
		var latLngs = this._poly.getLatLngs(),
		perimeter = 0;
		
		// Check to see if we should calculate the area
		if (this.options.showArea) {
			this._area = L.GeometryUtil.geodesicArea(latLngs);
		}

		// Check to see if we should calculate the perimeter
		if (this.options.showPerimeter) {
			this._perimeter = L.GeometryUtil.perimeter(latLngs);
		}
	},

	_getTooltipText: function () {
		var text, subtext, measurement, area, perimeter, lineBreak;

		if (this._markers.length === 0) {
			text = L.drawLocal.draw.handlers.polygon.tooltip.start;
		} else if (this._markers.length < 3) {
			text = L.drawLocal.draw.handlers.polygon.tooltip.cont;
		} else {
			text = L.drawLocal.draw.handlers.polygon.tooltip.end;
			
			measurement = this._getMeasurementString();
			
			//updated to optionally display area and/or perimeter of polygon during drawing
			area = this.options.showArea ? 'Area: ' + measurement.area : '';
			perimeter = this.options.showPerimeter ?  'Perimeter: ' + measurement.perimeter : '';
			lineBreak = this.options.showArea && this.options.showPerimeter ? '<br>' : '';

			subtext = area + lineBreak + perimeter;
		}

		return {
			text: text,
			subtext: subtext
		};
	},

	_getMeasurementString: function () {
		return {area: this.options.showArea ? L.GeometryUtil.readableArea(this._area, this.options.metric) : '', perimeter: this.options.showPerimeter ? L.GeometryUtil.readableDistance(this._perimeter, this.options.metric) : ''};
	},

	_shapeIsValid: function () {
		return this._markers.length >= 3;
	},

	_cleanUpShape: function () {
		var markerCount = this._markers.length;

		if (markerCount > 0) {
			this._markers[0].off('click', this._finishShape, this);
		}
	}
});
