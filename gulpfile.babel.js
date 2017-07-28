import gulp from 'gulp'
import sass from 'gulp-sass'
import postcss from 'gulp-postcss'
import plumber from 'gulp-plumber'
import autoprefixer from 'autoprefixer'
import {rollup} from 'rollup'
import buble from 'rollup-plugin-buble'
import insert from 'rollup-plugin-insert'
import {argv} from 'yargs'

const LIBRARY = 'library'
const MODAL = 'modal'

const ENTRIES = [LIBRARY, MODAL]

const generate = ext => ENTRIES.map(item => `src/${item}/*.${ext}`)

const scripts = generate('js')
const styles = generate('scss')

export const script = () => Promise.all(ENTRIES.map(entry => rollup({
  entry: `src/${entry}/index.js`,
  external: ['art-dialog', 'jquery', 'underscore', 'backbone', 'backbone.marionette'],
  plugins: [insert.transform((code, id) => `export default ${JSON.stringify(code)}`, {
    include: '**/*.html'
  }), buble()]
}).then(bundle => bundle.write({
  banner: argv.watch && `document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></script>');`,
  dest: `docs/${entry}.js`,
  format: 'iife',
  globals: {
    'art-dialog': 'dialog',
    jquery: 'jQuery',
    underscore: '_',
    backbone: 'Backbone',
    'backbone.marionette': 'Marionette'
  }
})))).catch(console.error)

export const style = () => gulp.src(styles)
  .pipe(plumber())
  .pipe(sass())
  .pipe(postcss([autoprefixer({browsers: ['> 0%']})]))
  .pipe(gulp.dest('docs'))

export const watchScript = () => gulp.watch(scripts, script)
export const watchStyle = () => gulp.watch(styles, style)

export const watch = () => {
  script()
  watchScript()
  watchStyle()
}

export default gulp.parallel(script, style)
