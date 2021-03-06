/*globals document, window,  */

import "snapsvg";
import "snap.svg.zpd";

import defaultSettings from "./default-settings.js";
import defaultTestBikes from "./default-input-bikes.js";
import BikeGeometry from "./parse-geometry.js";
import BikeDrawing from "./draw-bike-snapsvg.js";


export default drawBikeComparison;

function drawBikeComparison(bike_geometries, settings) {
    "use strict";

    var drawSettings = defaultSettings;
    // TODO: Extend drawSettings with settings

    // TodO: Possibly refactor inputsGeometries to be a separate object outside of drawSettings.
    
    drawSettings['inputsGeometries'] = bike_geometries || defaultTestBikes;

    this.bikeDrawings = [];

    var bikecanvas = "#visual_bike",
        bikeGeometries = [],
        paper = Snap.select(bikecanvas),
        bounds = {
            x_min: 0,
            x_max: 0,
            y_min: 0,
            y_max: 0,
        },
        start_zoom,
        bbox;

    paper.zpd('destroy')
    paper.clear();

    function drawNames(bikeDrawings, paper, start_x, start_y) {

        var start_x = start_x || 0,
            start_y = start_y || 0,
            height = 20,
            x = start_x,
            y = start_y - 2 * height,
            names = [];

        for (var i = 0; i < bikeDrawings.length; i ++) {
            names.push(paper.text(x, y, bikeDrawings[i].title ).attr({'fill': drawSettings['colours'][i % drawSettings['colours'].length]}))
            y -= height;
        }

    }

    for (let i = 0; i < drawSettings['inputsGeometries'].length; i++) {
        var rawGeometryData = drawSettings['inputsGeometries'][i];
        var bike = new BikeGeometry(rawGeometryData, drawSettings);
        bikeGeometries.push(bike);
        if (bike.error){
            if (rawGeometryData.hasOwnProperty('title')){
                console.log("WARNING! There was a problem with the " + rawGeometryData.title + " geometry. (Geometry " + (i+1) + ")");
            } else {
               console.log("WARNING! There was a problem with Geometry " + (i + 1) + ".");
            }
            console.log("Unable to calculate: " + bike.error_parameters);
            console.log(bike);

        }
    };


    for (let i = 0; i < bikeGeometries.length; i++) {
        var drawing = new BikeDrawing(bikeGeometries[i], paper, drawSettings['colours'][i % drawSettings['colours'].length], 0, 0, drawSettings);
        this.bikeDrawings.push(drawing);
    };

    for (let i = 0; i < this.bikeDrawings.length; i++) {
        this.bikeDrawings[i].draw();
    };

    for (let i = 0; i < bikeGeometries.length; i++) {
        bounds.y_min = Math.min(bounds.y_min, bikeGeometries[i].resolvedPoint.min_y);
        bounds.x_min = Math.min(bounds.x_min, bikeGeometries[i].resolvedPoint.min_x);
        bounds.x_max = Math.max(bounds.x_max, bikeGeometries[i].resolvedPoint.max_x);
        bounds.y_max = Math.max(bounds.y_max, bikeGeometries[i].resolvedPoint.max_y);
    };

    drawNames(this.bikeDrawings, paper, bounds.x_min, bounds.y_min);

    // Use snap.svg's zpd plugin.
    // TODO: These could probably be moved to a separate snapsvg specific module.

    // Calculate initial zoom values
    bounds.dx = bounds.x_max - bounds.x_min;
    bounds.dy = bounds.y_max - bounds.y_min;
    start_zoom = Math.min($(bikecanvas).height()/bounds.dy, $(bikecanvas).width()/bounds.dx);

    if (isNaN(start_zoom)){
        start_zoom = 0.3;
    }

    //bbox = paper.getBBox();

    var loading_animation_bounce_factor = 0.95;

    // TODO: Calculate initial offsets. 350 is a 'it works' placeholder.
    var initial_x_offset = 350 * loading_animation_bounce_factor,
        initial_y_offset = 350 * loading_animation_bounce_factor;

    paper.zpd({
        load: {
                  a: start_zoom,        // Conversion Factor 'zoom'
                  b: 0,
                  c: 0,
                  d: start_zoom,        // Conversion Factor 'zoom'
                  e: initial_x_offset,               // Offset X
                  f: initial_y_offset,               // Offset Y
              }
    }, function (err, paper) {
        if (err){
            console.log("SnapSVG error: '"+ err +"'");
            console.log(paper);
        }
    });

    paper.zoomTo(start_zoom * loading_animation_bounce_factor, 1350, mina.elastic);

}