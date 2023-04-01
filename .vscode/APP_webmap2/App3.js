require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer"
  ], function (esriConfig,Map, MapView, FeatureLayer) {

    let apikey = "AAPKc0b5b552c4324dc29a90351172d2b735eM1eJrecMDQYEQZi4rnGIPsjY_Llxx1p0nXXbkHOEsxXmYiO6lqTiBkAGXsSplrm";
    esriConfig.apiKey = apikey;
    const map = new Map({
      basemap: "dark-gray-vector"
    });
const mapadiv = document.getElementById("sceneDiv");
    const view = new MapView({
      container:mapadiv,
      map: map,
      center: [-73.95, 40.702],
      zoom: 12,
      padding: {
        right: 300
      }
    });

    const listNode = document.getElementById("nyc_graphics");

    /********************
     * Add feature layer
     ********************/

    // Create the PopupTemplate
    const popupTemplate = {
      // autocasts as new PopupTemplate()
      title: "{NAME} in {COUNTY}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "B12001_calc_pctMarriedE",
              label: "% Married",
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: "B12001_calc_numMarriedE",
              label: "Total Married",
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: "B12001_calc_numNeverE",
              label: "Never Married",
              format: {
                places: 0,
                digitSeparator: true
              }
            },
            {
              fieldName: "B12001_calc_numDivorcedE",
              label: "Total Divorced",
              format: {
                places: 0,
                digitSeparator: true
              }
            }
          ]
        }
      ]
    };

    // Create the FeatureLayer using the popupTemplate
    const featureLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/ACS_Marital_Status_Boundaries/FeatureServer/2",
      outFields: ["NAME", "GEOID"], // used by queryFeatures
      popupTemplate: popupTemplate
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
              orderByFields: ["GEOID"]
            })
            .then(function (results) {
              graphics = results.features;

              const fragment = document.createDocumentFragment();

              graphics.forEach(function (result, index) {
                const attributes = result.attributes;
                const name = attributes.NAME;

                // Create a list zip codes in NY
                const li = document.createElement("li");
                li.classList.add("panel-result");
                li.tabIndex = 0;
                li.setAttribute("data-result-id", index);
                li.textContent = name;

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

    // listen to click event on the zip code list
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
  });