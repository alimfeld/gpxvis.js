define(["gmaps"], function(gmaps) {

	function Map(element, mapOptions) {
		console.log(element);
		this.map = new gmaps.Map(element, mapOptions);
	}	

	Map.prototype.drawTrack = function(track) {
		var polyline = new gmaps.Polyline({
			path: track.toPath(),
			map: this.map
		});
	};

	function create(element) {
		var myLatLng = new google.maps.LatLng(0, -180);
		var mapOptions = {
			zoom: 3,
			center: myLatLng,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};
		return new Map(element, mapOptions);
	}

	return {
		create: create
	};

});
