export const pinSymbol = {
  type: "text", 
  text: "\ue61d", // esri-icon-map-pin
  font: {
    size: 20,
    family: "CalciteWebCoreIcons"
  }
}

export const visibleSymbol = { 
  type: "simple-fill", 
  color: [0, 255, 255, 0.18],
  outline: {
    color: '#00FFFF',
    width: 0.5
  } 
}

export const locationSymbol = {
  type: "picture-marker",  // autocasts as new PictureMarkerSymbol()
  url: 'https://static.arcgis.com/images/Symbols/Firefly/FireflyC9.png', 
  width: '48px',
  height: '48px'
}