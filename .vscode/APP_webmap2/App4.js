require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer"
  ],(esriConfig,Map,MapView,FeatureLayer)=>{
    let apikey = "AAPKc0b5b552c4324dc29a90351172d2b735eM1eJrecMDQYEQZi4rnGIPsjY_Llxx1p0nXXbkHOEsxXmYiO6lqTiBkAGXsSplrm";
    esriConfig.apiKey = apikey;
    const map = new Map({
        basemap: "dark-gray-vector"
      });
  const mapadiv = document.getElementById("sceneDiv");
      const view = new MapView({
        container:mapadiv,
        map: map,
        center: [-87.17929083855614,14.064041972386855],
        zoom: 11,
        padding: {
          right: 300}});

    const listNode = document.getElementById("nyc_graphics");
    const popupTemplate = {
        // autocasts as new PopupTemplate()
        title: "Cuadrante: {PageName}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "Cod_Depart",
                label: "Codigo departamento",
                format: {
                  places: 0,
                  digitSeparator: true
                }
              },
              {
                fieldName: "Departamen",
                label: "Departamento",
                format: {
                  places: 0,
                  digitSeparator: true
                }
              },
              {
                fieldName: "PageName",
                label: "Cuadrante",
                format: {
                  places: 0,
                  digitSeparator: true
                }
              },
              {
                fieldName: "Tipo",
                label: "Tipo",
                format: {
                  places: 0,
                  digitSeparator: true
                }
              }
            ]
          }
        ]
      };

      const featureLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/Bj0C34LhO8GxYj4O/arcgis/rest/services/Malla_1km_WGS84/FeatureServer",
        outFields: ["Departamen", "PageName"], // used by queryFeatures
        popupTemplate: popupTemplate,
        opacity:0.2
      });
      map.add(featureLayer);
  
      let graphics;

      view.whenLayerView(featureLayer).then(function (layerView) {
        layerView.watch("updating", function (value) {
          if (!value) {
            // wait for the layer view to finish updating
  
            // query all the features available for drawing.
            layerView
              .queryFeatures({
                geometry: view.extent,
                returnGeometry: true,
                orderByFields: ["PageName"]
              })
              .then(function (results) {
                graphics = results.features;
  
                const fragment = document.createDocumentFragment();
  
                graphics.forEach(function (result, index) {
                  const attributes = result.attributes;
                  const name = attributes.PageName;
  
                  // Create a list zip codes in NY
                  const li = document.createElement("li");
                  li.classList.add("panel-result");
                  li.tabIndex = 0;
                  li.setAttribute("data-result-id", index);
                  li.textContent = name;
                  li.style.textAlign = "center";
  
                  fragment.appendChild(li);
                });
                // Empty the current list
                listNode.innerHTML = "";
                listNode.appendChild(fragment);
              })
              .catch(function (error) {
                console.error("query failed: ", error);
              });
          }
        });
      });

    listNode.addEventListener("click", onListClickHandler);

    function onListClickHandler(event) {
      const target = event.target;
      const resultId = target.getAttribute("data-result-id");

      // get the graphic corresponding to the clicked zip code
      const result = resultId && graphics && graphics[parseInt(resultId, 10)];
      console.log(result);

      if (result) {
        // open the popup at the centroid of zip code polygon
        // and set the popup's features which will populate popup content and title.

        view
          .goTo(result.geometry.extent.expand(3))
          .then(function () {
            view.popup.open({
              features: [result],
              location: result.geometry.centroid
            });
          })
          .catch(function (error) {
            if (error.name != "AbortError") {
              console.error(error);
            }
          });
      }
    }


  })