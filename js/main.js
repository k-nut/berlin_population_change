require.config({
  paths: {
    leaflet:  "../bower_components/leaflet/dist/leaflet",
    omnivore: "../bower_components/leaflet-omnivore/leaflet-omnivore",
    lodash:   "../bower_components/lodash/dist/lodash",
    jquery:   "../bower_components/jquery/dist/jquery"
  },
  shim: {
    "leaflet-label": {exports: "L.Label", deps: ["leaflet"]}
    }
});


require(["leaflet", "omnivore", "lodash", "jquery", "leaflet-label"], function(L, omnivore, _, $, label){
  "use strict";
  var peopleData;
  var min = 1;
  var max = 1;
  $.getJSON("./data.json", function(data){
    peopleData = data;
    window.p = peopleData;
    _.forEach(peopleData, function(datum){
      var keys = _.keys(datum);
      _.forEach(keys, function(key){
        var change = datum[key].change;
        if (change > max){
          max =  change;
        }
        if (change < min){
          min = change;
        }
      });
    });
  });

  var map = L.map("map").setView([52.516, 13.350], 11);

  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
  }).addTo(map);

  var districtLayer = L.geoJson(null, {
    //http:leafletjs.com/reference.html#geojson-style
    style:  {
      color: "blue",
      fillOpacity: 0.5
    }
  });


  var colorDistrictsByYear = function(year){
    document.getElementById("year").innerHTML = year;
    _.forEach(districtLayer.getLayers(), function(district){
      var districtName = district.feature.properties.id;
      var change = peopleData[year.toString()][districtName].change;
      var population = peopleData[year.toString()][districtName].value;
      var red = change < 1 ? 0 : 255;
      var green = change > 1 ? 0 : 255;
      var color = "rgb(" + red + "," + green + ",0)";
      district.setStyle({"fillColor": color});
      var label = new L.Label();
      label.setContent(districtName + "<br />" + population);
      label.setLatLng(district.getBounds().getCenter());
      map.showLabel(label);
    });
  };

  omnivore.topojson("./berlin_bezirke.topojson", null, districtLayer).addTo(map).on("ready",
    function(){
      var years = _.range(2001,2013);
      var counter = 0;
      var interv = window.setInterval(function(){
        colorDistrictsByYear(years[counter]);
        counter++;
        if (counter === years.length){
          counter = 0;
        }
      }, 1000);
    }
  );
});
