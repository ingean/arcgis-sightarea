import esriConfig from 'https://js.arcgis.com/4.22/@arcgis/core/config.js'
import Map from 'https://js.arcgis.com/4.22/@arcgis/core/Map.js'
import MapView from 'https://js.arcgis.com/4.22/@arcgis/core/views/MapView.js'
import FeatureLayer from 'https://js.arcgis.com/4.22/@arcgis/core/layers/FeatureLayer.js'
import GraphicsLayer from 'https://js.arcgis.com/4.22/@arcgis/core/layers/GraphicsLayer.js'
import ActionBar from './ActionBar.js'
import MapTheme from './MapTheme.js'
import MapLocation from './MapLocation.js'
import VisibleArea from './VisibleArea.js'
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
  container: "viewDiv",
  padding: {
    left: 49
  }
})

const locationsLayer = new GraphicsLayer({title: "Lokasjoner"})
const visibleareasLayer = new GraphicsLayer({title: "Synlige områder"})
map.addMany([obstructionsLayer, visibleareasLayer, locationsLayer])
const visibleArea = new VisibleArea(obstructionsLayer, visibleareasLayer)

view.whenLayerView(obstructionsLayer).then(layerView => {
  layerView.watch('updating', val => {
    if (!val) {  // Wait for the layerView to finish updating
      layerView.queryFeatures().then(results => {
        let obstructions = []
        results.features.forEach(feature => obstructions.push(feature.geometry))
        visibleArea.obstructions = obstructions
      })
    }
  })
})


const actionBar = new ActionBar(view, 'viewshed')
const locationsList = new MapLocationList('locations', view)
mapTheme.view = view

view.on("click", event => {
  locationsList.addLocation(new MapLocation(locationsLayer, event.mapPoint))
  visibleArea.calculateVisibleArea(event.mapPoint)
})

const deleteAll = () => {
  let layers = [locationsLayer, visibleareasLayer]
  layers.forEach(layer => {layer.removeAll()})
  locationsList.deleteAll()
}

document.querySelector("#header-title").textContent = 'Finn synlige områder for valgte lokasjoner'
document.querySelector("calcite-shell").hidden = false
document.querySelector("calcite-loader").active = false
document.querySelector('#delete-all-btn').addEventListener('click', deleteAll)