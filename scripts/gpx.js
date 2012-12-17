define(["jquery", "gmaps"], function($, gmaps) {

  var lastId = 0;

  function Gpx($gpx) {
    this.wayPoints = [];
    this.wayPointsByPosition = {};
    this.tracks = [];

    var self = this;
    $gpx.find("wpt").each(function() {
      var wayPoint = new WayPoint($(this));
      self.wayPoints.push(wayPoint);
      self.wayPointsByPosition[wayPoint.position] = wayPoint;
    });
    $gpx.find("trk").each(function() {
      self.tracks.push(new Track($(this), self));
    });
  }

  function Track($trk, gpx) {
    this.id = ++lastId;
    this.name = $trk.children("name").text();
    this.trackPoints = [];
    this.elevationMissing = false;
    var prevTrackPoint = undefined;

    var self = this;
    $trk.find("trkpt").each(function() {
      var trackPoint = new WayPoint($(this));
      trackPoint.track = self;

      if (prevTrackPoint) {
        trackPoint.distRel = gmaps.geometry.spherical.computeDistanceBetween(prevTrackPoint.position, trackPoint.position);
        trackPoint.dist = prevTrackPoint.dist + trackPoint.distRel;
      } else {
        trackPoint.distRel = 0;
        trackPoint.dist = 0;
      }

      prevTrackPoint = trackPoint;
      self.trackPoints.push(trackPoint);

      if (!trackPoint.ele) {
        self.elevationMissing = true;
      }

      var wayPoint = gpx.wayPointsByPosition[trackPoint.position];
      if (wayPoint) {
        trackPoint.name = wayPoint.name;
        trackPoint.desc = wayPoint.desc;
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

  Track.prototype.addMissingElevation = function(callback) {
    if (!this.elevationMissing) {
      callback();
      return;
    }
    var elevationService = new gmaps.ElevationService();
    var self = this;
    elevationService.getElevationForLocations({ locations: this.toPath() }, function(results, status) {
      if (status == gmaps.ElevationStatus.OK) {
        if (results.length > 0) {
          $.each(results, function(index, result) {
            self.trackPoints[index].ele = result.elevation;
          });
          self.elevationMissing = false;
        } else {
          console.log("ElevationService: No results found");
        }
      } else {
        console.log("ElevationService: Failed with status: " + status);
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

// vim: et:si:sw=2:sts=2
