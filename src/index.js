const _ = require('lodash')
const jsyaml = require('js-yaml')
const mustache = require('mustache')

function renderer(container, template) {
  const cell = container.ownerDocument.createElement('template')
  return {
    render(item) {
      const html = mustache.render(template, item)
      if (html) {
        cell.innerHTML = html
        container.appendChild(cell.content)
      }
    }
  }
}

function renderTransform(base, root, renderer, transform) {
  base = _.merge({}, base, root.default)
  root.items.forEach(item => {
    const result = mergeDefault(base, transform(base, item))
    renderer.render(result)
    if (result.items) renderTransform(base, result, renderer, transform)
  })
}


function iterate(container, template, yaml, transform) {
  const json = jsyaml.safeLoad(yaml)
  renderTransform({}, json, renderer(container, template), transform)
}

function mergeDefault(base, item) {
  if (_.isObject(item)) return _.merge({}, base, item)
  return item || base
}

function identity(base, item) { return item }

export function simple(container, template, yaml) {
  iterate(container, template, yaml, identity)
}

// components can only be virtualized if you know their widths ahead of time so no autosizing (but preprocessing is possible)
// data file, webpage, blob of js (embedded on that webpage), git versioning. if i had file system access, would this be easy?
// todo: consider yaml or back to js for lighter wiehgt syntax
// scale? some kind of max-width.
// the cover project for games? libretro can do thumbnails. idk... i want them to look stellar but i also don't want to maintain these?
// would prefer thumbnails be consistently sized actually, especially within a system.
// filter sort reorder
// todo: url should include assets/thumbnails/?
// program, webpage, data, vcs-data
// keep honing the dsl. separate the library
// anchor.href = media.app ? media.app : `${json.imageBaseURL || ''}/${media.images[0].url}`
// trying to figure  out how to create an element inline and grow it
// underneath another element so i can have a form thing where you keep
// all the ui
// anchor.onclick = () => {
//   document
// }


export function render(container, template, yaml) {
  iterate(container, template, yaml, (base, item) => {
    return Object.assign({}, item, {images: (item.images || []).map(image => {
      const i = Object.assign({}, base.image, image)
      const rotated = i.rotate % 90 === 0 && i.rotate % 360
      i.top = rotated ? i.width : 0
      i.containerwidth = rotated ? i.height : i.width
      i.containerheight = rotated ? i.width : i.height
      return i
    })})
  })
}
