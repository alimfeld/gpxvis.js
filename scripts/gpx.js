define(["jquery", "gmaps"], function($, gmaps) {

  var lastId = 0;

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

  function Track($trk) {
    var self = this;

    this.id = ++lastId;
    this.name = $trk.children("name").text();
    this.trackPoints = [];
    this.wayPointsWithoutElevation = [];
    this.mapLatLngToWayPointIndex = {};

    var prevWayPoint = undefined;
    var self = this;

    $trk.find("trkpt").each(function() {
      var wayPoint = new WayPoint($(this));
      wayPoint.track = self;

      if (prevWayPoint) {
        wayPoint.distRel = gmaps.geometry.spherical.computeDistanceBetween(prevWayPoint.position, wayPoint.position);
        wayPoint.dist = prevWayPoint.dist + wayPoint.distRel;
      } else {
        wayPoint.distRel = 0;
        wayPoint.dist = 0;
      }

      prevWayPoint = wayPoint;
      self.trackPoints.push(wayPoint);

      // Remember way points without elevation
      if (!wayPoint.ele) {
        var position = wayPoint.position;
        var index = self.trackPoints.length;
        self.mapLatLngToWayPointIndex[position.toString()] = index;
        self.wayPointsWithoutElevation.push(position);
      }
    });
  }

  Track.prototype.toPath = function() {
    return $.map(this.trackPoints, function(trackPoint) {
      return trackPoint.position;
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
      return callback();
    } 

    console.log("ElevationLookUp: Look up data for " 
        + this.wayPointsWithoutElevation.length + " locations in track " + this.name);


    var elevationService = new gmaps.ElevationService();
    var positionalRequest = {
      "locations": this.wayPointsWithoutElevation
    };

    var self = this;

    elevationService.getElevationForLocations(positionalRequest, function(results, status) {
      if (status == gmaps.ElevationStatus.OK) {
        if (results.length > 0) {
          console.log("ElevationLookUp: Got " + results.length + " results");

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
        console.log("ElevationLookUp: Failed due to: " + status);
      }
      callback();
    });
  };

  Track.prototype.findNearestTrackPoint = function(position) {
    var trackPoint = null;
    var lowestDist = null;
    $.each(this.trackPoints, function() {
      var dist = gmaps.geometry.spherical.computeDistanceBetween(position, this.position);
      if (lowestDist === null || dist < lowestDist) {
        lowestDist = dist;
        trackPoint = this;
      }
    });
    return trackPoint;
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

    this.position = new gmaps.LatLng(this.lat, this.lon);
  }

  function load(url, callback) {
    $.ajax({
      url: url,
      dataType: "xml",
      success: function(data) {
        var gpx = new Gpx($(data));
        callback(gpx);
      }
    });
  }

  return {
    load: load
  }
});

// vim: expandtab:shiftwidth=2:softtabstop=2
