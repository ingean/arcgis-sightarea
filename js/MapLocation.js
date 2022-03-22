import * as locator from 'https://js.arcgis.com/4.22/@arcgis/core/rest/locator.js'

export default class MapLocation {
  async #geocodeReverse(location) {
    let response = await locator.locationToAddress(this.locatorUrl, {location})
    return response.attributes.ShortLabel
  }

  constructor(mapPoint) {
    this.locatorUrl = 'http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer'
    this.point = mapPoint  
    this.address = this.#geocodeReverse(this.point)
  }
}