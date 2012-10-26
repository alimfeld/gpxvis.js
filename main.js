requirejs.config({

	paths: {
		jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min'
	}
});

require(['gpx'], function(gpx) {
	gpx.load(
		'gpx/foxboro.gpx',
		function(gpx) {
			console.log(gpx);
		});
});
