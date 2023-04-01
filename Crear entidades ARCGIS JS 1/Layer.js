require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",

    "esri/layers/FeatureLayer",
    "esri/widgets/Editor"

  ], function(esriConfig, Map, MapView, FeatureLayer, Editor) {

    // Reference a feature layer to edit

    const stylevial = {
        type: "simple",
        symbol: {
          type: "simple-line",
          style: "solid",
          color: "#FFFF00",
          width: "2px"
        }
      };
    const myPointsFeatureLayer = new FeatureLayer({
      url: "https://services7.arcgis.com/BkBWluvkeY0YU2ux/arcgis/rest/services/Red_Vial_Ocotepeque_API_JS/FeatureServer/0",
      renderer:stylevial
    });

   esriConfig.apiKey = "AAPKc0b5b552c4324dc29a90351172d2b735eM1eJrecMDQYEQZi4rnGIPsjY_Llxx1p0nXXbkHOEsxXmYiO6lqTiBkAGXsSplrm";

    const map = new Map({
      basemap: "arcgis-imagery-standard", // Basemap layer service

      layers: [myPointsFeatureLayer]
 
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-88.925088649255,14.3944421873827],
      zoom: 10
    });

    // Editor widget
    const editor = new Editor({
      view: view
    });
    // Add widget to the view
    view.ui.add(editor, "top-right");

  });