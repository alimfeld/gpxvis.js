define(["jquery", "gvis"], function($, gvis) {

    function ElevationProfile(track, targetDiv) {
        addChildElements(targetDiv);
        
        var dashboard = createDashboard(targetDiv);
        var control = createControlWrapper();
        var chart = createChartWrapper();
        var data = buildDataTable(track);

        dashboard.bind(control, chart);
        dashboard.draw(data);

		gvis.events.addListener(chart, "ready", function() {
			gvis.events.addListener(chart.getChart(), "onmouseover", function(data) {
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
                }
            }
        });
        
        gvis.events.addListener(controlWrapper, 'statechange', function(e) {
            if (!e.inProgress) {
                console.log(controlWrapper.getState());
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
        // TODO refactor, include coordinates
        var columnDefinition = [
            { "id": 0, "label": "Distance", "type": "number"},
            { "id": 1, "label": "Elevation", "type": "number"},
           // { "id": 2, "label": "Latitude", "type": "number", "role": "annotation-text" },
            //{ "id": 3 }
        ];
        
        var dataArray = [];
        
        $.each(track.trackSegments, function(trackSegmentNr, trackSegment) {
            $.each(trackSegment.trackPoints, function(trackPointNr, trackPoint) {
                var row = [
                    parseFloat(trackPoint.dist),
                    parseFloat(trackPoint.ele),
                    //parseFloat(trackPoint.lat), 
                    //parseFloat(trackPoint.lon)
                    //trackPoint
                ];
                dataArray.push(row);
            })
        });
        
        var dt = new gvis.DataTable({ 
            "cols": columnDefinition,
            //"rows": dataArray
        }); 
        
        dt.addRows(dataArray);
        return dt;
    }
    
    return {
        build: ElevationProfile
    }

});
