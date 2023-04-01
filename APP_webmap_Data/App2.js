require(["esri/config",
         "esri/WebMap",
         "esri/Map",
         "esri/widgets/Legend",
         "esri/views/MapView",
         "esri/widgets/FeatureTable",
         "esri/core/reactiveUtils"],(
            esriConfig,
            WebMap,
            Map,
            Legend,
            MapView,
            FeatureTable,
            reactiveUtils
         )=>{

            esriConfig.apiKey = "AAPKc0b5b552c4324dc29a90351172d2b735eM1eJrecMDQYEQZi4rnGIPsjY_Llxx1p0nXXbkHOEsxXmYiO6lqTiBkAGXsSplrm";
            const containermapvier = document.getElementById("viewDiv");
            const webmap = new WebMap({
                portalItem: {
                  id: "568582b15b3b4a51bcb49888b6e52ddb"
                }
              });
        
              const view = new MapView({
                container: "viewDiv",
                map: webmap
        
              });
        
              const legend = new Legend ({
                view: view
              });
              view.ui.add(legend, "top-right");

              
              view.when(()=>{
                const featureLayer = webmap.findLayerById("Malla");
                //featureLayer.title = "Malla DC";
                //featureLayer.outFields = ["*"];
    
                const appContainer = document.getElementById("container-total-id");
                const tableContainer = document.getElementById("tableContainer");
                const tableDiv = document.getElementById("tableDiv");
    
                const featureTable = new FeatureTable({
                view: view, 
                layer: featureLayer,
                tableTemplate: {
                  columnTemplates: [
                    {
                      type: "field",
                      fieldName: "Departamen",
                      label: "Departamento",
                      direction: "asc"
                    },
                    {
                      type: "field",
                      fieldName: "PageName",
                      label: "Cuadrante"
                    },
                    {
                      type: "field",
                      fieldName: "Municipio",
                      label: "Municipio"
                    }
                  ]
                },
                container: tableDiv
              });
    
              view.ui.add(document.getElementById("inputdiv"), "top-left");
    
              const checkboxEle = document.getElementById("checkboxId");
              const labelText = document.getElementById("label-esri");
    
              checkboxEle.onchange = () => {
                toggleFeatureTable();
              };
    
              function toggleFeatureTable() {
                // Check if the table is displayed, if so, toggle off. If not, display.
                if (!checkboxEle.checked) {
                 containermapvier.style.height = "600px";
                  appContainer.removeChild(tableContainer);
                  labelText.innerHTML = "Show Feature Table";
                } else {
                
                  appContainer.appendChild(tableContainer);
                  labelText.innerHTML = "Hide Feature Table";
                  containermapvier.style.height = "400px";

                }
              }
    
            })
    
            reactiveUtils.watch(
                () => view.popup.viewModel.active,
                () => {
                  selectedFeature = view.popup.selectedFeature;
                  if (selectedFeature !== null && view.popup.visible !== false) {
                    featureTable.highlightIds.removeAll();
                    featureTable.highlightIds.add(
                      view.popup.selectedFeature.attributes.OBJECTID
                    );
                    id = selectedFeature.getObjectId();
                  }
                }
              );

         });