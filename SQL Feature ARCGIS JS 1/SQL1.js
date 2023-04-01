require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
  ], function(esriConfig, Map, MapView, FeatureLayer) {

    esriConfig.apiKey = "AAPKc0b5b552c4324dc29a90351172d2b735eM1eJrecMDQYEQZi4rnGIPsjY_Llxx1p0nXXbkHOEsxXmYiO6lqTiBkAGXsSplrm";

    const map = new Map({
      basemap: "arcgis-topographic" //Basemap layer service
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-87.17929083855614,14.064041972386855], //Longitude, latitude
      zoom: 8
    });

    // SQL query array
    const parcelLayerSQL = ["Selecciona un indicador SQL",
                            "POB_2000 > 15000",
                            "IDH_2002 >= 0.5",
                            "IDH_2002 >= 0.7",
                            "IDH_2002 <= 0.4",
                            "HOSPITAL > 1"];
    let whereClause = parcelLayerSQL[0];
    // Add SQL UI
    const select = document.createElement("select","");
    select.setAttribute("class", "esri-widget esri-select");
    select.setAttribute("style", "width: 200px; font-family: 'Avenir Next'; font-size: 1em");
    parcelLayerSQL.forEach(function(query){
      let option = document.createElement("option");
      option.value = query;
      option.innerHTML = query;
      select.appendChild(option);
    });

    view.ui.add(select, "top-right");

     // Listen for changes
    select.addEventListener('change', (event) => {
      whereClause = event.target.value;
      queryFeatureLayer(view.extent);

    });

    // Get query layer and set up query
const parcelLayer = new FeatureLayer({
      url: "https://services3.arcgis.com/Bj0C34LhO8GxYj4O/arcgis/rest/services/Mapa_Red_vial_WFL1/FeatureServer",
    });

    function queryFeatureLayer(extent) {
      const parcelQuery = {
       where: whereClause,  // Set by select element
       spatialRelationship: "intersects", // Relationship operation to apply
       geometry: extent, // Restricted to visible extent of the map
       outFields: ["POB_2000","IDH_2002","HOSPITAL","NOMBRE"], // Attributes to return
       returnGeometry: true
      };

      parcelLayer.queryFeatures(parcelQuery)

      .then((results) => {
        const elementodiv = document.createElement("div"," ");
        elementodiv.setAttribute("class","div-conteo");
        elementodiv.setAttribute("style",`background-color:rgba(0,0,0,0.6);
                                          width:200px;
                                          heigth:100px;
                                          color:yellow;
                                          font-size:12px; `)
        elementodiv.innerHTML = `Conteo de entidades: ${results.features.length} <br/>
                                 Indicadores sociales municipios HN.`;
        view.ui.add(elementodiv, "top-left");
        console.log("Feature count: " + results.features.length)
        displayResults(results);

      }).catch((error) => {
        console.log(error.error);
      });

    }

    function displayResults(results) {
      // Create a blue polygon
      const symbol = {
        type: "simple-fill",
        color: [ 20, 130, 200, 0.5 ],
        outline: {
          color: "black",
          width: .5
        },
        opacity:0.6};

      const popupTemplate = {
        title: "Municipio {NOMBRE}",
        content: "Poblacion: {POB_2000} <br> Indice de desarrollo humano: {IDH_2002} <br> Conteo de Hospital: {HOSPITAL}"
      };

      // Assign styles and popup to features
      results.features.map((feature) => {
        feature.symbol = symbol;
        feature.popupTemplate = popupTemplate;
        return feature;
      });

      // Clear display
      view.popup.close();
      view.graphics.removeAll();
      // Add features to graphics layer
      view.graphics.addMany(results.features);

    }

  });