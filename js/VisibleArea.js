import * as geometryEngine from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/geometryEngine.js'
import Graphic from 'https://js.arcgis.com/4.22/@arcgis/core/Graphic.js'
import Circle from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Circle.js'
import Polyline from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Polyline.js'
import Polygon from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Polygon.js'
import { visibleSymbol } from './config/symbols.js'


export default class VisibleArea {
  constructor(obstructionsLayer, visibleareasLayer) {
    this.debug = false
    this.obstructionsLayer = obstructionsLayer
    this.visibleareasLayer = visibleareasLayer
    this.obstructions = null 
    
    //this.getObstructions(obstructionsLayer)
  }

  calculateVisibleArea = (analysisLocation, numberOfPoints) => {

    const searchArea = new Circle({
      spatialReference: analysisLocation.spatialReference,
      geodesic: false,
      center: analysisLocation,
      radius: this.getRadius() || 100,
      radiusUnit: "meters",
      numberOfPoints: numberOfPoints || 360
    })
  
    const isValidIntersection = (intersection) => {
      return (intersection != null)
    }
  
    // FIND INTERSECTING OBSTRUCTIONS //
    const searchAreaObstructions = geometryEngine.intersect(this.obstructions, searchArea)
    const intersectingObstructions = searchAreaObstructions.filter(isValidIntersection)
  
    // CREATE SIGHTLINES //
    const sightlineFootprintIntersections = searchArea.rings[0].map((coords, coordIndex) => {
     
      // SIGHTLINE //
      const sightline = new Polyline({
        spatialReference: analysisLocation.spatialReference,
        paths: [[[analysisLocation.x, analysisLocation.y], [coords[0], coords[1]]]]
      })
      
      // CALC INTERSECTING LOCATIONS BETWEEN SIGHTLINE WITH OBSTRUCTIONS //
      const sightlineIntersections = geometryEngine.intersect(intersectingObstructions, sightline)
      const validSightlineIntersections = sightlineIntersections.filter(isValidIntersection)
  
      // FIND NEAREST INTERSECTION TO ANALYSIS LOCATION //
      let nearestIntersection = null
      if (validSightlineIntersections.length > 0) {
        const allSightlineIntersections = geometryEngine.union(validSightlineIntersections)
        nearestIntersection = geometryEngine.nearestVertex(allSightlineIntersections, analysisLocation).coordinate
      } else {
        nearestIntersection = searchArea.getPoint(0, coordIndex)
      }
      
      // ADD NEAREST INTERSECTION //
      return [nearestIntersection.x, nearestIntersection.y]
    })
  
    // VISIBLE AREA //
    const visibleArea = new Polygon({
      spatialReference: analysisLocation.spatialReference,
      rings: [sightlineFootprintIntersections]
    })

    this.addVisibleArea(visibleArea)
  }

  getRadius = () => {
    return document.querySelector('#radius-slider').value
  }

  addIntersection = (intersection, isNearest) => {
    this.intersectionsLayer.add(new Graphic({ geometry: intersection, attributes: { nearest: isNearest ? "nearest" : "not-nearest" } }))
  }

  addSightline = (sightline) => {
    this.sightlinesLayer.add(new Graphic({ geometry: sightline }))
  }

  addVisibleArea = (visibleArea) => {
    this.visibleareasLayer.add(
      new Graphic({ 
        geometry: visibleArea,
        symbol: visibleSymbol 
      })
    )
  }

  getObstructions = async (obstructionsLayer) => {
    let obstructions = []
    let results = await obstructionsLayer.queryFeatures()
    results.features.forEach(feature => obstructions.push(feature.geometry))
    this.obstructions = obstructions
  }
}
