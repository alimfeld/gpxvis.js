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

### events

Defines event constants and utility functions to fire and handle events.

### config

Defines default configuration settings for map and elevation profile display.

Features
--------

* Waypoint name and description is shown in an info-window on the map.

* Missing elevation data is automaticaly fetched using the [Google Elevation
  API](https://developers.google.com/maps/documentation/elevation/).

* The elevation profile can be zoomed in and out by selecting a range.

* The elevation profile is linked to the track drawn on the map and vice versa:
  - The current point (mouseover) is marked on the map and in the elevation profile.
  - The selected range is highlighted on the map.
  - The map automatically fits and centers the selected range.

Demo
----

A little [demo](http://alimfeld.github.com/gpxvis.js/) is published on [GitHub
Pages](http://pages.github.com/).

Credits
-------

* [RequireJS](http://requirejs.org): A JavaScript Module Loader and
  [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) implementation.
* [Requirejs-plugins](https://github.com/millermedeiros/requirejs-plugins):
  RequireJS plugins for use with the Google APIs.
* [Google Maps](https://developers.google.com/maps/)
* [Google Charts](https://developers.google.com/chart/)
* [Netcetera](https://github.com/netceteragroup) for sponsoring the work on
  gpxvis.js
