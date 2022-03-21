import esriConfig from 'https://js.arcgis.com/4.22/@arcgis/core/config.js'
import WebMap from 'https://js.arcgis.com/4.22/@arcgis/core/WebMap.js'
import MapView from 'https://js.arcgis.com/4.22/@arcgis/core/views/MapView.js'
import ActionBar from './ActionBar.js'
import ThemeSwitch from './ThemeSwitch.js'

esriConfig.apiKey = 'AAPKf28ba4fdd1e945a1be5f8d43dbd650eaMjyiDjdFXaCPZzo5erYJ7Xc7XKvBlbJZIPvNu0O2zwfeFiGhqoBvtQwJUZ1DMXIL'
const webmapId = 'ed9c982d0d4d4dcf8415d3c46e20c4c7' // Publicly available webmap

const map = new WebMap({
  portalItem: {
    id: webmapId
  }
});
await map.load();

const view = new MapView({
  map,
  container: "viewDiv",
  padding: {
    left: 49
  }
});

const actionBar = new ActionBar(view)
const theme = new ThemeSwitch(view)

const { title, description, thumbnailUrl, avgRating } = map.portalItem
document.querySelector("#header-title").textContent = title
document.querySelector("calcite-shell").hidden = false
document.querySelector("calcite-loader").active = false