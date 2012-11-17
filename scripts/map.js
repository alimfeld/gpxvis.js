define(["jquery", "gmaps"], function($, gmaps) {

  function Map(selector, mapOptions) {

    var map = new gmaps.Map($(selector)[0], mapOptions);
    var overlays = [];
    var currentTrackPoint = new gmaps.Marker({
      map: map,
      zIndex: gmaps.Marker.MAX_ZINDEX,
      icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    });
    var currentTrackRange = null;
    var openedInfoWindow = null;

    addEventListenerForTrackPointMarker();
    addEventListenerForTrackRangeChange();

    function addEventListenerForTrackPointMarker() {
      document.addEventListener("onTrackPointHover", function(event) {
        if (event.trackPoint) {
          currentTrackPoint.setPosition(event.trackPoint.toLatLng());
          currentTrackPoint.setMap(map);
        }
        else {
          currentTrackPoint.setMap(null);
        }
      }, false);
    }

    function addEventListenerForTrackRangeChange() {
      document.addEventListener("onChartRangeChanged", function(event) {
        var path = $.map(event.trackPoints, function(trackPoint) { return trackPoint.toLatLng(); });
        currentTrackRange.setPath(path);
        fitAndCenter(path);
      }, false);
    }

    function drawMarker(opts) {
      opts.map = map;
      var marker = new gmaps.Marker(opts);
      overlays.push(marker);
      return marker;
    }

    function drawPolyline(opts) {
      opts.map = map;
      var polyline = new gmaps.Polyline(opts);
      overlays.push(polyline);
      return polyline;
    }
  
    function fitAndCenter(points) {
      var bounds = new gmaps.LatLngBounds();
      $.each(points, function() { bounds.extend(this); });
      map.fitBounds(bounds);
    }

    this.drawWayPoints = function(wayPoints, icon) {
      $.each(wayPoints, function() {
        var marker = drawMarker({
          position: this.toLatLng(),
          icon: icon
        });
        var infoWindow = new gmaps.InfoWindow({
          content: "<h3>" + this.name + "</h3><p>" + this.desc + "</p>"
        });
        gmaps.event.addListener(marker, "click", function() {
          if (openedInfoWindow) {
            openedInfoWindow.close();
          }
          infoWindow.open(map, marker);
          openedInfoWindow= infoWindow;
        });
      });
    };

    this.drawTrack = function(track) {
      var path = track.toPath();
      drawPolyline({ path: path });
      currentTrackRange = drawPolyline({ path: path, strokeColor: "red" });
      drawMarker({
        position: path[0],
        zIndex: gmaps.Marker.MAX_ZINDEX - 2,
        icon: "http://maps.google.com/mapfiles/kml/pal4/icon20.png",
        shadow: "http://maps.google.com/mapfiles/kml/pal4/icon20s.png",
        title: "Start"
      });
      drawMarker({
        position: path[path.length - 1],
        zIndex: gmaps.Marker.MAX_ZINDEX - 1,
        icon: "http://maps.google.com/mapfiles/kml/pal4/icon21.png",
        shadow: "http://maps.google.com/mapfiles/kml/pal4/icon21s.png",
        title: "End"
      });
      var trackPointsWithName = $.grep(track.trackPoints, function(trackPoint) {
        return trackPoint.name;
      });
      this.drawWayPoints(trackPointsWithName, "http://labs.google.com/ridefinder/images/mm_20_blue.png");
      fitAndCenter(path);
    };

    this.clear = function() {
      $.each(overlays, function() { this.setMap(null); });
    };
  }

  function create(selector) {
    var myLatLng = new google.maps.LatLng(0, -180);
    var mapOptions = {
      zoom: 3,
      center: myLatLng,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    return new Map(selector, mapOptions);
  }

  return {
    create: create
  };

});

// vim:expandtab:shiftwidth=2:softtabstop=2
