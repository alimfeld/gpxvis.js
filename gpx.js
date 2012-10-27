define(["jquery", "gmaps"], function($, gmaps) {

	function Gpx($gpx) {
		var self = this;

		this.wayPoints = [];
		$gpx.find("wpt").each(function() {
			self.wayPoints.push(new WayPoint($(this)));
		});

		this.tracks = [];
		$gpx.find("trk").each(function() {
			self.tracks.push(new Track($(this)));
		});
	}
    
    Gpx.prototype.lookUpMissingElevationData = function(callback) {
        this.numberOfCallbackInvocations = 1;
        
        var self = this;
        
        function trackCallback(track) {
            console.log("Lookup complete for track " + track.name);
            console.log("trackCallback called " + self.numberOfCallbackInvocations + "/" + self.tracks.length + " times.");
            
            if (self.numberOfCallbackInvocations == self.tracks.length) {
                console.log("Lookup complete, calling external callback.");
                callback(self);
            } else {
                self.numberOfCallbackInvocations++;
            }
        }
        
        $.each(self.tracks, function(k, track) {
            track.lookUpMissingElevationData(trackCallback);
        });
    };

	function Track($trk) {
		var self = this;

		this.name = $trk.children("name").text();
		this.trackPoints = [];
        this.wayPointsWithoutElevation = [];
        this.mapLatLngToWayPointIndex = {};
        
        var prevWayPoint = undefined;
        var self = this;
        
		$trk.find("trkpt").each(function() {
            var wayPoint = new WayPoint($(this));
            
            if (prevWayPoint) {
				wayPoint.distRel = gmaps.geometry.spherical.computeDistanceBetween(prevWayPoint.toLatLng(), wayPoint.toLatLng());
				wayPoint.dist = prevWayPoint.dist + wayPoint.distRel;
			} else {
				wayPoint.distRel = 0;
				wayPoint.dist = 0;
			}
            
			prevWayPoint = wayPoint;
			self.trackPoints.push(wayPoint);

            // Remember way points without elevation
            if (!wayPoint.ele) {
                var latLng = wayPoint.toLatLng();
                var index = self.trackPoints.length;
                self.mapLatLngToWayPointIndex[latLng.toString()] = index;
                self.wayPointsWithoutElevation.push(latLng);
            }
		});
	}

	Track.prototype.getTrackPoint = function(index) {
		return this.trackPoints[index];
	};

	Track.prototype.getTrackPoints = function(startIndex, endIndex) {
		return this.trackPoints.slice(startIndex, endIndex + 1);
	};

	Track.prototype.toPath = function() {
		return $.map(this.trackPoints, function(trackPoint) {
			return trackPoint.toLatLng();
		});
	}

	Track.prototype.getDist = function() {
		if (this.trackPoints.length > 1) {
			return this.trackPoints[this.trackPoints.length - 1].dist;
		} else {
			return 0;
		}
	};
    
    Track.prototype.lookUpMissingElevationData = function(callback) {
        if (this.wayPointsWithoutElevation.length == 0) {
            console.log("No lookup needed for track " + this.name);
            return callback(this);
        } 
        
        console.log("ElevationLookUp: Look up data for " 
            + this.wayPointsWithoutElevation.length + " locations");
        
            
        var elevationService = new gmaps.ElevationService();
        var positionalRequest = {
            "locations": this.wayPointsWithoutElevation
        };
        
        var self = this;
        
        elevationService.getElevationForLocations(positionalRequest, function(results, status) {
            if (status == gmaps.ElevationStatus.OK) {
              if (results.length > 0) {
                console.log("ElevationLookUp: got " + results.length + " results");
                
                $.each(results, function(k, result) {
                    var key = result.location.toString();
                    var index = self.mapLatLngToWayPointIndex[key];
                    // TODO refactor, probably remove mapping table
                    self.trackPoints[k].ele = result.elevation;
                });
              } else {
                console.log("ElevationLookUp: No results found");
              }
            } else {
              console.log("ElevationLookUp: failed due to: " + status);
            }
            callback(self);
        });
    };

	function WayPoint($wtp) {
		var attributes = ["lat", "lon"];
		for (var i = 0; i < attributes.length; i++) {
			this[attributes[i]] = $wtp.attr(attributes[i]);
		}
        
		var elements = [ 
            { "name": "ele", "transform": parseFloat }, 
            { "name": "name" }, 
            { "name": "desc" } 
        ];
		for (var i = 0; i < elements.length; i++) {
            var name = elements[i].name;
            var transform = elements[i].transform;
            var text = $wtp.find(name).text();
            
            this[name] = transform ? transform(text) : text;
		}
	}

	WayPoint.prototype.toLatLng = function() {
		return new gmaps.LatLng(this.lat, this.lon);
	};

	function load(url, callback) {
		$.ajax({
			url: url,
			dataType: "xml",
			success: function(data) {
				var gpx = new Gpx($(data));
                gpx.lookUpMissingElevationData(callback);
			}
		});
	}
    
	return {
		load: load
	}
});
