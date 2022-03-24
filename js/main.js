import esriConfig from 'https://js.arcgis.com/4.22/@arcgis/core/config.js'
import Map from 'https://js.arcgis.com/4.22/@arcgis/core/Map.js'
import MapView from 'https://js.arcgis.com/4.22/@arcgis/core/views/MapView.js'
import FeatureLayer from 'https://js.arcgis.com/4.22/@arcgis/core/layers/FeatureLayer.js'
import GraphicsLayer from 'https://js.arcgis.com/4.22/@arcgis/core/layers/GraphicsLayer.js'
import ActionBar from './ActionBar.js'
import MapTheme from './MapTheme.js'
import MapLocation from './MapLocation.js'
import VisibilityAnalysis from './VisibilityAnalysis.js'
import MapLocationList from './MapLocationList.js'

esriConfig.apiKey = 'AAPKf28ba4fdd1e945a1be5f8d43dbd650eaMjyiDjdFXaCPZzo5erYJ7Xc7XKvBlbJZIPvNu0O2zwfeFiGhqoBvtQwJUZ1DMXIL'
const mapTheme = new MapTheme()

const obstructionsLayer = new FeatureLayer({
  url: 'https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/Hindringer/FeatureServer',
  minScale: 10000
})

let startExtent = await obstructionsLayer.queryExtent()

const map = new Map({
  basemap: mapTheme.darkBaseMap
})

const view = new MapView({
  map,
  extent: startExtent.extent,
  scale: 10000,
  container: "viewDiv",
  padding: {
    left: 49
  }
})

view.whenLayerView(obstructionsLayer).then(layerView => {
  layerView.watch('updating', val => {
    if (!val) {  // Wait for the layerView to finish updating
      layerView.queryFeatures().then(results => {
        let obstructions = []
        results.features.forEach(feature => obstructions.push(feature.geometry))
        visibilityAnalysis.obstructions = obstructions
      })
    }
  })
})

const locationsLayer = new GraphicsLayer({title: "Lokasjoner"})
const visibleareasLayer = new GraphicsLayer({title: "Synlige områder"})
map.addMany([obstructionsLayer, visibleareasLayer, locationsLayer])

const actionBar = new ActionBar(view, 'viewshed')
const visibilityAnalysis = new VisibilityAnalysis(obstructionsLayer, visibleareasLayer, actionBar.sketchLayer)
const locationsList = new MapLocationList('locations', view, locationsLayer, visibilityAnalysis)
mapTheme.view = view



let analysisActive = true

view.on("click", event => {
  if (!analysisActive) return
  locationsList.addLocation(new MapLocation(event.mapPoint))
  visibilityAnalysis.solve(event.mapPoint)
})

const deleteAll = () => {
  locationsList.removeAll()
  visibilityAnalysis.removeAllResults()
}

document.querySelector("#header-title").textContent = 'Finn synlige områder for valgte lokasjoner'
document.querySelector("calcite-shell").hidden = false
document.querySelector("calcite-loader").active = false
document.querySelector('#delete-all-btn').addEventListener('click', deleteAll)

document.querySelector('#aoi-edit-switch')
.addEventListener('calciteSwitchChange', event => {
  let widget = actionBar.widgets.sketch
  let sketchVM = widget.viewModel
  
  if (event.target.checked) {
    widget.visible = true
    sketchVM.updateOnGraphicClick = true
    analysisActive = false

  } else {
    widget.visible = false
    sketchVM.updateOnGraphicClick = false
    analysisActive = true
  }
})