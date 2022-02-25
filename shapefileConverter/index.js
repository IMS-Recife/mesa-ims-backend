// Using CommonJS modules
const ogr2ogr = require("ogr2ogr").default;
const fs = require("fs");

const projects = [
  {
    folderName: "PQCAPIBARIBE",
    files: [
      { name: "PROJ_PQCAPIBARIBE_CORREDORESECOAMB", extesion: "shp" },
      { name: "PROJ_PQCAPIBARIBE_INFILTRAÇÕES", extesion: "shp" },
      { name: "PROJ_PQCAPIBARIBE_MACROZONA", extesion: "shp" },
      { name: "PROJ_PQCAPIBARIBE_TRECHOS", extesion: "shp" },
      { name: "PROJ_PQCAPIBARIBE_ZONAPARQUE", extesion: "shp" },
    ],
  },
];

projects.forEach((project) => {
  const pathToShapefiles = `./shapefiles/${project.folderName}`;

  project.files.forEach((file) => {
    const shapefile = `${pathToShapefiles}/${file.name}.${file.extesion}`;

    // Callback API
    ogr2ogr(shapefile, {options: ['-t_srs', 'EPSG:4326']}).exec((err, response) => {
      if (!err) {
        if (response.text) {
          fs.writeFile(
            `${pathToShapefiles}/${file.name}.json`,
            response.text,
            (error) => {
              console.log(error);
            }
          );
        }
      }
    });
  });
});
