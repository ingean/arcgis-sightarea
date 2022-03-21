import * as locator from 'https://js.arcgis.com/4.22/@arcgis/core/rest/locator.js'
import Graphic from 'https://js.arcgis.com/4.22/@arcgis/core/Graphic.js'
import { locationSymbol } from './config/symbols.js'


export default class MapLocation {
  async #geocodeReverse(location) {
    let response = await locator.locationToAddress(this.locatorUrl, {location})
    return response.attributes.ShortLabel
  }
  
  async #addToMap() {
    let label = await this.shortLabel
    let graphic = new Graphic({
      geometry: this.point,
      symbol: locationSymbol,
      attributes: {
        name: label
      }
    })
    this.layer.add(graphic)
  }

  constructor(layer, mapPoint) {
    this.locatorUrl = 'http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer'
    this.layer = layer
    this.point = mapPoint  
    this.address = this.#geocodeReverse(this.point)

    this.#addToMap() 
  }
}