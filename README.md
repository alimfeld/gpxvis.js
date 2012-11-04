gpxvis.js
=========

JavaScript [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) modules for
visualizing a [GPX](http://www.topografix.com/gpx.asp) file.

Modules
-------

### gpx

Loads a GPX file from an URL.

### map

Creates a map using the [Google Maps API](https://developers.google.com/maps/)
and allows to draw tracks and waypoints from a GPX file.

### elep

Creates an elevation profile for a track using the [Google Chart
Tools](https://developers.google.com/chart/).

Features
--------

* Waypoint name and description is shown in an info-window on the map.

* Missing elevation data is automaticaly fetched using the [Google Elevation
  API](https://developers.google.com/maps/documentation/elevation/).

* The elevation profile can be zoomed in and out (additional control to select a range).

* The elevation profile is linked to the track drawn on the map:
  - The current point (mouseover) is marked on the map.
  - The selected range is highlighted on the map.
  - The map automatically fits and centers the selected range.

Credits
-------

* [RequireJS](http://requirejs.org): A JavaScript Module Loader and
  [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) implementation.
* [Google Maps](https://developers.google.com/maps/)
* [Google Charts](https://developers.google.com/chart/)
* [Netcetera](https://github.com/netceteragroup) for sponsoring the work on
  gpxvis.js
