L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
	//there may be a more suitable general location for this function
	validateNumeric: function(value) {
		//taken from http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
  		return !isNaN(parseFloat(value)) && isFinite(value);
	},

	// Ported from the OpenLayers implementation. See https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270
	geodesicArea: function (latLngs) {
		var pointsCount = latLngs.length,
			area = 0.0,
			d2r = L.LatLng.DEG_TO_RAD,
			p1, p2;

		if (pointsCount > 2) {
			for (var i = 0; i < pointsCount; i++) {
				p1 = latLngs[i];
				p2 = latLngs[(i + 1) % pointsCount];
				area += ((p2.lng - p1.lng) * d2r) *
						(2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
			}
			area = area * 6378137.0 * 6378137.0 / 2.0;
		}

		return Math.abs(area);
	},

	perimeter: function(latLngs) {
		var perimeter = latLngs[0].distanceTo(latLngs[1]);
		for (var i = 1; i < latLngs.length - 1; i++) {
			perimeter += latLngs[i].distanceTo(latLngs[i + 1]);
		}
		perimeter += latLngs[latLngs.length - 1].distanceTo(latLngs[0]);

		return perimeter;
	},

	readableArea: function (area, isMetric, unitScale) {
		var areaStr;

		if (this.validateNumeric(area)) {
			if (isMetric) {
				if (area >= 10000 && unitScale) {
					areaStr = (area * 0.0001).toFixed(2) + ' ha';
				} else {
					areaStr = area.toFixed(2) + ' m&sup2;';
				}
			} else {
				area /= 0.836127; // Square yards in 1 meter

				if (area >= 3097600 && unitScale) { //3097600 square yards in 1 square mile
					areaStr = (area / 3097600).toFixed(2) + ' mi&sup2;';
				} else if (area >= 4840 && unitScale) {//48040 square yards in 1 acre
					areaStr = (area / 4840).toFixed(2) + ' acres';
				} else {
					areaStr = Math.ceil(area) + ' yd&sup2;';
				}
			}
		}
		return areaStr;
	},

	readableDistance: function (distance, isMetric, unitScale) {
		var distanceStr;

		if (this.validateNumeric(distance)) {
			if (isMetric) {
				// show metres when distance is < 1km, then show km
				//updated to show 2 decimal places for m and yd measurements
				if (distance > 1000 && unitScale) {
					distanceStr = (distance  / 1000).toFixed(2) + ' km';
				} else {
					distanceStr = parseFloat(Math.round(distance * 100) / 100).toFixed(2) + ' m';
				}
			} else {
				distance *= 1.09361;

				if (distance > 1760 && unitScale) {
					distanceStr = (distance / 1760).toFixed(2) + ' miles';
				} else {
					distanceStr = parseFloat(Math.round(distance * 100) / 100).toFixed(2) + ' yd';
				}
			}
		}

		return distanceStr;
	}
});
