import VectorTileLayer from 'https://js.arcgis.com/4.22/@arcgis/core/layers/VectorTileLayer.js'
import Basemap from 'https://js.arcgis.com/4.22/@arcgis/core/Basemap.js'

const darkMap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      url: 'https://services.geodataonline.no/arcgis/rest/services/GeocacheVector/GeocacheKanvasMork/VectorTileServer/resources/styles/root.json'
    })
  ],
  title: 'Bakgrunnskart (Mørk)'
})

const lightMap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      url: 'https://services.geodataonline.no/arcgis/rest/services/GeocacheVector/GeocacheGraatone/VectorTileServer/resources/styles/root.json'
    })
  ],
  title: 'Bakgrunnskart (Lys)'
})

export default class ThemeSwitch {
  constructor(view, swichBasemap = true) {
    this.view = view
    this.swichBasemap = swichBasemap
    document
    .querySelector("calcite-switch")
    .addEventListener("calciteSwitchChange", this.toggleThemes)
  }

  toggleThemes = () => {
    // calcite theme
    document.querySelector('#calcite-theme').classList.toggle("calcite-theme-dark")
    // jsapi theme
    const dark = document.querySelector("#jsapi-theme-dark")
    const light = document.querySelector("#jsapi-theme-light")
    dark.disabled = !dark.disabled
    light.disabled = !light.disabled
    // jsapi basemap color
    if(this.swichBasemap) {
      this.view.map.basemap = dark.disabled ? lightMap : darkMap
    }
  }
}