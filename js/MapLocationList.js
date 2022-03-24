import Graphic from 'https://js.arcgis.com/4.22/@arcgis/core/Graphic.js'
import { locationSymbol } from './config/symbols.js'
import { createElement } from "./Element.js"

export default class MapLocationList {
    
  async #addToMap(mapLocation) {
    let address = await mapLocation.address
    let graphic = new Graphic({
      geometry: mapLocation.point,
      symbol: locationSymbol,
      attributes: {
        id: `${mapLocation.point.x}-${mapLocation.point.x}`,
        name: address
      }
    })
    this.layer.add(graphic)
  }
  
  
  constructor(id, view, layer, analysis) {
    this.view = view
    this.layer = layer
    this.id = id
    this.analysis = analysis
    this.listElement = document.querySelector(`#${id}-list`)

    document
    .querySelectorAll(`.${this.category}-list-item-action`)
    .forEach(e => e.addEventListener('click', this.handleLocationZoom))
  }

  addLocation = async (mapLocation) => {   
    let action =  createElement('calcite-action', {
      class: `${this.id}-list-item-action`,
      slot: 'actions-end',
      icon: 'trash'
    })

    action.addEventListener('click', event => this.deleteItem(event, `${mapLocation.point.x}-${mapLocation.point.x}`))

    let item = createElement('calcite-value-list-item', {
      class: `${this.id}-list-item`,  
      label: await mapLocation.address,
      value: `${mapLocation.point.x}-${mapLocation.point.x}`
      },
      action
    )
    item.addEventListener('click', event => this.view.goTo(mapLocation.point))
    
    this.listElement.appendChild(item)
    this.#addToMap(mapLocation)
  }

  deleteItem = (event, id) => {
    event.target.parentNode.remove(event.target)  // Delete item from list

    // Delete point from map
    let point = this.layer.graphics.find(g => g.attributes.id == id)
    this.layer.remove(point)

    this.analysis.removeResult(id) // Delete analysis result
  } 

  removeAll = () => {
    this.listElement.innerHTML = ''
    this.layer.removeAll()
  }
} 