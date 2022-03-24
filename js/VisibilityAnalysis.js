import * as geometryEngine from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/geometryEngine.js'
import Graphic from 'https://js.arcgis.com/4.22/@arcgis/core/Graphic.js'
import Circle from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Circle.js'
import Polyline from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Polyline.js'
import Polygon from 'https://js.arcgis.com/4.22/@arcgis/core/geometry/Polygon.js'
import { visibleSymbol } from './config/symbols.js'


export default class VisibilityAnalysis {
  #calcArea(polygon, units = 'square-meters', geodesic = false) {
    return geodesic 
      ? geometryEngine.geodesicArea(polygon, units) 
      : geometryEngine.planarArea(polygon, units)
  }
  
  #getRadius() {
    return document.querySelector('#radius-slider').value
  }

  #isValidIntersection(intersection) {
    return (intersection != null)
  }

  #updateTotalArea() {
    this.totalArea = 0
    this.visibleGraphics.forEach(graphic => {
      this.totalArea += this.#calcArea(graphic.geometry)
    })
  }

  #updateAreaInfo = (visiblePolygonsUnion) => {
    const aoiPolygonsUnion = this.#unionGraphics([...this.aoiLayer.graphics])
    const coveragePolygon = geometryEngine.intersect(aoiPolygonsUnion, visiblePolygonsUnion)
   
    if (coveragePolygon) { // Area of interest is defined and overlaps analysis
      const coverageArea = this.#calcArea(coveragePolygon)
      const aoiArea = this.#calcArea(aoiPolygonsUnion)
      document.querySelector('#coverage-area').innerHTML = Math.round((coverageArea / aoiArea ) * 100)
    }

    const totalAreaUnion = this.#calcArea(visiblePolygonsUnion)
    const displayArea = (totalAreaUnion > 500) ? (totalAreaUnion / 1000).toFixed(1) : Math.round(totalAreaUnion)
    const displayUnit = (totalAreaUnion > 500) ? 'mål' : 'm<SUP>2</SUP>'
    document.querySelector('#total-area').innerHTML = displayArea
    document.querySelector('#total-area-unit').innerHTML = displayUnit
    
    const overlapArea = Math.abs(this.totalArea - totalAreaUnion)
    document.querySelector('#overlap-area').innerHTML = Math.round((overlapArea / totalAreaUnion) * 100)
  }

  #unionGraphics = (graphics) => {
    const polygons = graphics.map(graphic => graphic.geometry)
    return this.#unionPolygons(polygons)
  }

  #unionPolygons = (polygons) => {
    const multipartPolygon = new Polygon({
      spatialReference: this.spatialReference,
      rings: []
    })

    let selfIntersecting = false
    polygons.forEach((polygon) => {
      if (geometryEngine.intersects(multipartPolygon, polygon)) {
        selfIntersecting = true
      }
      multipartPolygon.addRing(polygon.rings[0])
    })

    return selfIntersecting ? geometryEngine.union(polygons) : multipartPolygon
  }

  #addResult = (analysisPoint, resultRing) => {
    const visibleGraphic = new Graphic({
      attributes: {
        id: `${analysisPoint.x}-${analysisPoint.x}`,
      },
      geometry: new Polygon({
        spatialReference: this.spatialReference,
        rings: [resultRing]
      }),
      symbol: visibleSymbol 
    })

    this.visibleGraphics.push(visibleGraphic)
    this.totalArea += this.#calcArea(visibleGraphic.geometry)
    this.#updateResult()
  }

  #updateResult = () => {
    const visiblePolygonsUnion = this.#unionGraphics(this.visibleGraphics)
    
    // Update map
    this.visiblePolygonsLayer.removeAll()
    this.visiblePolygonsLayer.add(
      new Graphic({ 
        geometry: visiblePolygonsUnion,
        symbol: visibleSymbol 
      })
    )

    this.#updateAreaInfo(visiblePolygonsUnion)
  }
  
  constructor(obstructionsLayer, visiblePolygonsLayer, aoiLayer) {
    this.debug = false
    this.obstructionsLayer = obstructionsLayer
    this.visiblePolygonsLayer = visiblePolygonsLayer
    this.aoiLayer = aoiLayer
    this.obstructions = null 
    this.visibleGraphics = []
    this.totalArea = 0
    this.spatialReference = null
  }

  solve = (analysisPoint, numberOfPoints) => {
    this.spatialReference = analysisPoint.spatialReference

    const searchCircle = new Circle({
      spatialReference: this.spatialReference,
      geodesic: false,
      center: analysisPoint,
      radius: this.#getRadius() || 100,
      radiusUnit: "meters",
      numberOfPoints: numberOfPoints || 360
    })
  
    // FIND INTERSECTING OBSTRUCTIONS //
    const obstructionsInBuffer = geometryEngine.intersect(this.obstructions, searchCircle)
    const intersectingObstructions = obstructionsInBuffer.filter(this.#isValidIntersection)
  
    // CREATE SIGHTLINES //
    const sightlineNearestIntersections = searchCircle.rings[0].map((coords, coordIndex) => {
     
      const sightline = new Polyline({
        spatialReference: analysisPoint.spatialReference,
        paths: [[[analysisPoint.x, analysisPoint.y], [coords[0], coords[1]]]]
      })
      
      // CALC INTERSECTING LOCATIONS BETWEEN SIGHTLINE WITH OBSTRUCTIONS //
      const sightlineIntersections = geometryEngine.intersect(intersectingObstructions, sightline)
      const validSightlineIntersections = sightlineIntersections.filter(this.#isValidIntersection)
  
      // FIND NEAREST INTERSECTION TO ANALYSIS LOCATION //
      let nearestIntersection = null
      if (validSightlineIntersections.length > 0) {
        const allSightlineIntersections = geometryEngine.union(validSightlineIntersections)
        nearestIntersection = geometryEngine.nearestVertex(allSightlineIntersections, analysisPoint).coordinate
      } else {
        nearestIntersection = searchCircle.getPoint(0, coordIndex)
      }
      
      return [nearestIntersection.x, nearestIntersection.y]
    })
  
    this.#addResult(analysisPoint, sightlineNearestIntersections)  
  }

  removeResult = (id) => {
    this.visibleGraphics = this.visibleGraphics.filter(graphic => graphic.attributes.id != id)
    this.#updateTotalArea()
    
    // Remove from map
    this.#updateResult()
  }

  removeAllResults = () => {
    this.totalArea = 0
    this.visibleGraphics = []
    document.querySelector('#total-area').innerHTML = 0
    document.querySelector('#total-area-unit').innerHTML = 'm<SUP>2</SUP>'
    document.querySelector('#overlap-area').innerHTML = 0
    document.querySelector('#coverage-area').innerHTML = 0
    this.visiblePolygonsLayer.removeAll()
  }
}


