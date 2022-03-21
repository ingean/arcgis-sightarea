import { createElement } from "./Element.js"

export default class MapLocationList {
  constructor(id, view) {
    this.view = view
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
      label: await mapLocation.address
      },
      createElement('calcite-action', {
        class: `${this.id}-list-item-action`,
        slot: 'actions-end',
        icon: 'map-pin'
      })
    )
    item.addEventListener('click', e => this.view.goTo(mapLocation.point))
    
    this.listElement.appendChild(item)
  }

  deleteAll = () => {
    this.locations = []
    this.listElement.innerHTML = ''
  }
} 