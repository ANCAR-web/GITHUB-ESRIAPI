require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/Expand",
    "esri/request",
    "esri/layers/FeatureLayer",
    "esri/layers/support/Field",
    "esri/Graphic"
  ], (
    esriConfig,
    Map,
    MapView,
    Expand,
    request,
    FeatureLayer,
    Field,
    Graphic
  ) => {

    esriConfig.apiKey = "AAPKc0b5b552c4324dc29a90351172d2b735eM1eJrecMDQYEQZi4rnGIPsjY_Llxx1p0nXXbkHOEsxXmYiO6lqTiBkAGXsSplrm";
    const portalUrl = "https://www.arcgis.com";
    const formulario = document.getElementById("uploadForm");
    formulario.addEventListener("change",(event)=>{
        const filename = event.target.value.toLowerCase();
        if(filename.indexOf('.zip') !== -1){
            generateFeatureCollection(filename);
        }else{
            let status = document.getElementById("upload");
            status.innerHTML = "Agregega un elemento ZIP";
            status.style.color = "red";
        }});
    const mapcontainer = document.getElementById("viewDiv");

    const map = new Map({
            basemap: "dark-gray-vector"
          });
  
     const view = new MapView({
            center: [-41.647, 36.41],
            zoom: 2,
            map: map,
            container:mapcontainer,
            popup: {
              defaultPopupTemplateEnabled: true
            }});

    const fileForm = document.getElementById("mainWindow");

    const expand = new Expand({
        expandIconClass: "esri-icon-upload",
        view: view,
        content: fileForm
      });

      view.ui.add(expand, "top-right");

      function generateFeatureCollection(fileName){
        let name = fileName.split('.');
        name = name[0].replace("c:\\fakepath\\"," ");
        const uploadstatus = document.getElementById("upload-status");
        uploadstatus.innerHTML = "<b>Cargando </b>" + name;

        const params = {
          name: name,
          targetSR: view.spatialReference,
          maxRecordCount: 5000,
          enforceInputFileSizeLimit: true,
          enforceOutputJsonSizeLimit: true
        };
        params.generalize = true;
        params.maxAllowableOffset = 10;
        params.reducePrecision = true;
        params.numberOfDigitsAfterDecimal = 0;

        const myContent = {
          filetype: "shapefile",
          publishParameters: JSON.stringify(params),
          f: "json"
        };

        request(portalUrl + "/sharing/rest/content/features/generate", {
          query: myContent,
          body: document.getElementById("uploadForm"),
          responseType: "json"
        })
          .then((response) => {
            const layerName =
              response.data.featureCollection.layers[0].layerDefinition.name;
            document.getElementById("upload-status").innerHTML =
              "<b>Cargado: </b>" + layerName;
            addShapefileToMap(response.data.featureCollection);
          })
          .catch(errorHandler);
      }

      function errorHandler(error) {
        document.getElementById("upload-status").innerHTML =
          "<p style='color:red;max-width: 500px;'>" + error.message + "</p>";
      }

      function addShapefileToMap(featureCollection) {
        // add the shapefile to the map and zoom to the feature collection extent
        // if you want to persist the feature collection when you reload browser, you could store the
        // collection in local storage by serializing the layer using featureLayer.toJson()
        // see the 'Feature Collection in Local Storage' sample for an example of how to work with local storage
        let sourceGraphics = [];

        const layers = featureCollection.layers.map((layer) => {
          const graphics = layer.featureSet.features.map((feature) => {
            return Graphic.fromJSON(feature);
          });
          sourceGraphics = sourceGraphics.concat(graphics);
          const featureLayer = new FeatureLayer({
            objectIdField: "FID",
            source: graphics,
            fields: layer.layerDefinition.fields.map((field) => {
              return Field.fromJSON(field);
            })
          });
          return featureLayer;
          // associate the feature with the popup on click to enable highlight and zoom to
        });
        map.addMany(layers);
        view.goTo(sourceGraphics).catch((error) => {
          if (error.name != "AbortError") {
            console.error(error);
          }
        });

        document.getElementById("upload-status").innerHTML = "";
      }



          


    });


