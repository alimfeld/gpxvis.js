define(["jquery", "gvis", "events", "config"], function($, gvis, events, config) {

  function ElevationProfile(targetDiv, track) {
    this.track = track;

    addChildElements(targetDiv);

    this.dashboard = createDashboard(targetDiv);
    this.controlWrapper = createControlWrapper();
    this.chartWrapper = createChartWrapper();

    this.firstRow = 0;

    this.dashboard.bind(this.controlWrapper, this.chartWrapper);

    var self = this;
    track.addMissingElevation(function() {
      self.dataTable = createDataTable(self.track);
      self.dashboard.draw(self.dataTable);
    });

    this.addControlWrapperStateChangeListener();
    this.addChartWrapperListener();

    events.handle(events.TRACK_POINT_HOVER, function(event) {
      var trackpoint = event.data.trackpoint;
      if (trackpoint && trackpoint.track === self.track) {
        var row = self.track.trackpoints.indexOf(trackpoint) - self.firstRow;
        self.chartWrapper.getChart().setSelection([{row: row}]);
      } else {
        self.chartWrapper.getChart().setSelection();
      }
    });
  }

  function addChildElements(targetDiv) {
    $(targetDiv).append("<div id=\"chart\"></div>");
    $(targetDiv).append("<div id=\"control\"></div>");
  }

  function createDashboard(targetDiv) {
    return new gvis.Dashboard($(targetDiv)[0]);
  }

  function createControlWrapper() {
    var controlWrapper = new gvis.ControlWrapper(config.applyControlWrapperConfig({
      controlType: "ChartRangeFilter",
      containerId: "control",
      options: {
        filterColumnIndex: 0
      }
    }));

    return controlWrapper;
  }

  function createChartWrapper() {
    return new gvis.ChartWrapper(config.applyChartWrapperConfig({
      chartType: "AreaChart",
      containerId: "chart"
    }));
  }

  function createDataTable(track) {
    var dataArray = [];
    var namedTrackpointCount = 0;

    $.each(track.trackpoints, function(trackpointNr, trackpoint) {
      var annotation = null;
      var annotationText = null;
      var distance = Math.round(trackpoint.dist / 1000) + " km";
      var elevation = Math.round(trackpoint.ele) + " m";
      if (trackpoint.name) {
        namedTrackpointCount += 1;
        annotation = "" + namedTrackpointCount;
        annotationText = trackpoint.name + " (" + elevation + ")";
      }
      dataArray.push([ 
        trackpoint.dist / 1000,
        trackpoint.ele,
        distance + " / " + elevation,
        annotation,
        annotationText
        ]);
    });

    var dt = new gvis.DataTable();
    dt.addColumn({ type: "number", label: "Distance", pattern: "#.#" });
    dt.addColumn({ type: "number", label: "Elevation", pattern: "#" });
    dt.addColumn({ type: "string", role: "tooltip" });
    dt.addColumn({ type: "string", role: "annotation" });
    dt.addColumn({ type: "string", role: "annotationText" });
    dt.addRows(dataArray);

    return dt;
  }

  ElevationProfile.prototype.addControlWrapperStateChangeListener = function() {
    var self = this;
    gvis.events.addListener(self.controlWrapper, 'statechange', function(e) {
      if (!e.inProgress) {
        var range = self.controlWrapper.getState().range;
        var filteredRowIds = self.dataTable.getFilteredRows(
          [{
            "column": 0, 
            "minValue": range.start, 
            "maxValue": range.end 
          }]
          );
        self.firstRow = filteredRowIds[0];
        self.lastRow = filteredRowIds[filteredRowIds.length - 1];
        events.fire(events.TRACK_RANGE_CHANGE, {
          track: self.track,
          trackpoints: self.track.trackpoints.slice(self.firstRow, self.lastRow + 1)
        });
      }
    });
  };

  ElevationProfile.prototype.addChartWrapperListener = function() {
    var self = this;
    gvis.events.addListener(self.chartWrapper, "ready", function() {
      gvis.events.addListener(self.chartWrapper.getChart(), "onmouseover", function(data) {
        var trackpoint = self.track.trackpoints[self.firstRow + data.row];
        events.fire(events.TRACK_POINT_HOVER, { trackpoint: trackpoint });
      });
      $("#chart").mouseleave(function() {
        events.fire(events.TRACK_POINT_HOVER, { trackpoint: null });
      });
    });
  }

  function create(targetDiv, track) {
    return new ElevationProfile(targetDiv, track);
  }

  return {
    create: create
  }

});

// vim: et:si:sw=2:sts=2
