define(['jquery', 'gvis'], function($, gvis) {

    function ElevationProfile(gpx, targetDiv) {
        var data = buildDataTable(gpx);

        var options = {
            width: 512,
            height: 200,
            legend: 'none',
            titleY: 'Elevation (m)',
            titleX: 'Distance (m)',
            focusBorderColor: '#00ff00',
            curveType: 'function',
            vAxis: {
                minValue: data.getColumnRange(1).min
            }
        };

        var chart = new gvis.LineChart(document.getElementById(targetDiv));
        chart.draw(data, options);
    }
    
    function buildDataTable(gpx) {
        dataArray = [['Distance', 'Elevation']];
        
        $.each(gpx.tracks, function(trackNr, track) {
            $.each(track.trackSegments, function(trackSegmentNr, trackSegment) {
                $.each(trackSegment.trackPoints, function(trackPointNr, trackPoint) {
                    dataArray.push([parseFloat(trackPoint.dist), parseFloat(trackPoint.ele)]);
                })
            })
        });
        
        return gvis.arrayToDataTable(dataArray);
    }
    
    return {
        build: ElevationProfile
    }

});
