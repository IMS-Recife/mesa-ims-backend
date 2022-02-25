const transformation = require('transform-coordinates')
const fs = require('fs')

const transform = transformation('EPSG:31985', '4326')

const projects = [
  {
    folderName: 'PQCAPIBARIBE',
    files: [
      { name: 'PROJ_PQCAPIBARIBE_CORREDORESECOAMB', extesion: 'json' },
      { name: 'PROJ_PQCAPIBARIBE_INFILTRAÇÕES', extesion: 'json' },
      { name: 'PROJ_PQCAPIBARIBE_MACROZONA', extesion: 'json' },
      { name: 'PROJ_PQCAPIBARIBE_TRECHOS', extesion: 'json' },
      { name: 'PROJ_PQCAPIBARIBE_ZONAPARQUE', extesion: 'json' },
    ],
  },
];

projects.forEach((project) => {
  const pathToGeoJsons = `./shapefiles/${project.folderName}`

  project.files.forEach((file) => {
    const filePath = `${pathToGeoJsons}/${file.name}.${file.extesion}`
    const geoJson = require(filePath)

    geoJson.features.forEach(feature => {
      if (feature.geometry.type === 'LineString') {
        feature.geometry.coordinates.forEach(coordinate => {
          transformCoordinates(coordinate)
        })
      } else if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates.forEach(coordinateArray => {
          coordinateArray.forEach(coordinate => {
            transformCoordinates(coordinate)
          })
        })
      }
    })

    fs.writeFile(
      `./shapefiles/LatLon/${project.folderName}/${file.name}.json`,
      JSON.stringify(geoJson),
      (error) => {
        console.log(error)
      }
    )

  })
})

function transformCoordinates(coordinate) {
  const newCoords = transform.forward({ x: coordinate[0], y: coordinate[1] })

  coordinate[0] = newCoords.x
  coordinate[1] = newCoords.y
}
