define(["jquery", "gvis"], function($, gvis) {

    function ElevationProfile(track, targetDiv) {
        addChildElements(targetDiv);
        
        var dashboard = createDashboard(targetDiv);
        var controlWrapper = createControlWrapper();
        var chartWrapper = createChartWrapper();
        var dataTable = buildDataTable(track);
        
        dashboard.bind(controlWrapper, chartWrapper);
        dashboard.draw(dataTable);

        addControlWrapperStateChangeListener(controlWrapper, dataTable, track);
        addChartWrapperListener(chartWrapper, track);
    }

    function addChildElements(targetDiv) {
        $(targetDiv).append("<div id=\"chart\"></div>");
        $(targetDiv).append("<div id=\"control\"></div>");
    }
    
    function createDashboard(targetDiv) {
        return new gvis.Dashboard($(targetDiv)[0]);
    }
    
    function createControlWrapper() {
        var controlWrapper = new gvis.ControlWrapper({
            "controlType": "ChartRangeFilter",
            "containerId": "control",
            "options": {
                "filterColumnIndex": 0, // filter by distance
                "ui": {
                    "width": "50%",
                    "chartType": "AreaChart",
                    "chartOptions": {
                        "chartArea": { "width": "90%" },
                        "hAxis": {"baselineColor": "none"},
                    },
                    "snapToData": true
                }
            }
        });
        
        return controlWrapper;
    }
    
    function createChartWrapper() {
        return new gvis.ChartWrapper({
            "chartType": "AreaChart",
            "containerId": "chart",
            "options": {
                "width": "50%",
                "chartArea": { "width": "90%" },
                "legend": "none",
                "titleY": "Elevation (m)",
                "titleX": "Distance (m)",
                "focusBorderColor": "#00ff00",
            }
        });
    }
    
    function buildDataTable(track) {
        var dataArray = [];
        
        $.each(track.trackPoints, function(trackPointNr, trackPoint) {
            dataArray.push([ 
                trackPoint.dist,
                parseFloat(trackPoint.ele)
            ]);
        });
        
        var dt = new gvis.DataTable();
        dt.addColumn("number", "Distance");
        dt.addColumn("number", "Elevation");
        dt.addRows(dataArray);
        
        return dt;
    }
    
    function addControlWrapperStateChangeListener(controlWrapper, dataTable, track) {
        gvis.events.addListener(controlWrapper, 'statechange', function(e) {
            if (!e.inProgress) {
				var range = controlWrapper.getState().range;
				var filteredRowIds = dataTable.getFilteredRows(
					[{
						"column": 0, 
					"minValue": range.start, 
					"maxValue": range.end 
					}]
				);
                fireChartRangeChangedEvent(track.getTrackPoints(filteredRowIds[0], filteredRowIds[filteredRowIds.length - 1]));
            }
        });
    }
    
    function fireChartRangeChangedEvent(trackPoints) {
		var event = document.createEvent("Event");
		event.initEvent("onChartRangeChanged", true, true);
		event.trackPoints = trackPoints;
		document.dispatchEvent(event);
	}
    
    function addChartWrapperListener(chartWrapper, track) {
        gvis.events.addListener(chartWrapper, "ready", function() {
			gvis.events.addListener(chartWrapper.getChart(), "onmouseover", function(data) {
				var trackPoint = track.getTrackPoint(data.row);
				fireOnTrackPointHoverEvent(trackPoint);
		   	});
		});
    }
    
    function fireOnTrackPointHoverEvent(trackPoint) {
		var event = document.createEvent("Event");
		event.initEvent("onTrackPointHover", true, true);
		event.trackPoint = trackPoint;
		document.dispatchEvent(event);
	}
    
    return {
        build: ElevationProfile
    }

});
