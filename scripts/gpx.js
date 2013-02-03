define(["jquery", "gmaps"], function($, gmaps) {

  var lastId = 0;

  function Gpx($gpx) {
    this.waypoints = [];
    this.waypointsByPosition = {};
    this.tracks = [];

    var self = this;
    $gpx.find("wpt").each(function() {
      var waypoint = new Waypoint($(this));
      self.waypoints.push(waypoint);
      self.waypointsByPosition[waypoint.position] = waypoint;
    });
    $gpx.find("trk").each(function() {
      self.tracks.push(new Track($(this), self));
    });
  }

  function Track($trk, gpx) {
    this.id = ++lastId;
    this.name = $trk.children("name").text();
    this.trackpoints = [];
    this.elevationMissing = false;
    var prevTrackpoint = undefined;

    var self = this;
    $trk.find("trkpt").each(function() {
      var trackpoint = new Waypoint($(this));
      trackpoint.track = self;

      if (prevTrackpoint) {
        trackpoint.distRel = gmaps.geometry.spherical.computeDistanceBetween(prevTrackpoint.position, trackpoint.position);
        trackpoint.dist = prevTrackpoint.dist + trackpoint.distRel;
      } else {
        trackpoint.distRel = 0;
        trackpoint.dist = 0;
      }

      prevTrackpoint = trackpoint;
      self.trackpoints.push(trackpoint);

      if (!trackpoint.ele) {
        self.elevationMissing = true;
      }

      var waypoint = gpx.waypointsByPosition[trackpoint.position];
      if (waypoint) {
        trackpoint.name = waypoint.name;
        trackpoint.desc = waypoint.desc;
      }
    });
  }

  Track.prototype.toPath = function() {
    return $.map(this.trackpoints, function(trackpoint) {
      return trackpoint.position;
    });
  }

  Track.prototype.getDist = function() {
    if (this.trackpoints.length > 1) {
      return this.trackpoints[this.trackpoints.length - 1].dist;
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
            self.trackpoints[index].ele = result.elevation;
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

  Track.prototype.findNearestTrackpoint = function(position) {
    var trackpoint = null;
    var lowestDist = null;
    $.each(this.trackpoints, function() {
      var dist = gmaps.geometry.spherical.computeDistanceBetween(position, this.position);
      if (lowestDist === null || dist < lowestDist) {
        lowestDist = dist;
        trackpoint = this;
      }
    });
    return trackpoint;
  };

  function Waypoint($wtp) {
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
