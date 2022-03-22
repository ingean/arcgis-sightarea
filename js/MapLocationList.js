import Graphic from 'https://js.arcgis.com/4.22/@arcgis/core/Graphic.js'
import { locationSymbol } from './config/symbols.js'
import { createElement } from "./Element.js"

export default class MapLocationList {
    
  async #addToMap(mapLocation, id) {
    let address = await mapLocation.address
    let graphic = new Graphic({
      geometry: mapLocation.point,
      symbol: locationSymbol,
      attributes: {
        id: id,
        name: address
      }
    })
    this.layer.add(graphic)
  }
  
  
  constructor(id, view, layer) {
    this.pointId = 0
    this.view = view
    this.layer = layer
    this.id = id
    this.listElement = document.querySelector(`#${id}-list`)
    this.locations = []

    document
    .querySelectorAll(`.${this.category}-list-item-action`)
    .forEach(e => e.addEventListener('click', this.handleLocationZoom))
  }

  addLocation = async (mapLocation) => {
    this.locations.push(mapLocation)
 
    let item = createElement('calcite-value-list-item', {
      class: `${this.id}-list-item`,  
      label: await mapLocation.address,
      value: this.pointId
      },
      createElement('calcite-action', {
        class: `${this.id}-list-item-action`,
        slot: 'actions-end',
        icon: 'map-pin'
      })
    )
    item.addEventListener('click', e => this.view.goTo(mapLocation.point))
    
    this.listElement.appendChild(item)
    this.#addToMap(mapLocation, this.pointId)
    this.pointId++
  }

  deleteAll = () => {
    this.locations = []
    this.listElement.innerHTML = ''
    this.layer.removeAll()
  }
} 