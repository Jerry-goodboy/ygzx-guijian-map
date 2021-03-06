import { rollup } from 'rollup';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';

var pkg = require('../package.json');
var copyright = '/* ' + pkg.name + ' - v' + pkg.version + ' - ' + new Date().toString() + '\n' +
                ' * Copyright (c) ' + new Date().getFullYear() + ' Environmental Systems Research Institute, Inc.\n' +
                ' * ' + pkg.license + ' */';

export default {
  entry: 'src/ShapeMarkers.js',
  moduleName: 'L.shapeMarkers',
  format: 'umd',
  external: ['leaflet'],
  plugins: [
    nodeResolve({
      jsnext: true,
      main: false,
      browser: false,
      extensions: [ '.js', '.json' ]
    }),
    json()
  ],
  globals: {
    'leaflet': 'L'
  },
  banner: copyright
}
