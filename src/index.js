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

function renderTransform(root, renderer, transform) {
  root.items.forEach(item => {
    const transformed = transform(item)
    renderer.render(transformed)
    if (transformed.items) iterate(transformed, cell, transform)
  })
}

function iterate(container, template, yaml, transform) {
  const json = jsyaml.safeLoad(yaml)
  renderTransform(json, renderer(container, template), transform)
}


function identityTransform(item) { return item }


export function simple(container, template, yaml) {
  iterate(container, template, yaml, identityTransform)
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


export function render(root, template, yaml) {
  const json = jsyaml.safeLoad(yaml)
  const cell = root.ownerDocument.createElement('template')
  function amazing (thing) {
    const base = Object.assign({url: '', x: 0, y: 0, width: 1, height: 1, rotate: 0, scale: 1}, thing.default && thing.default.image)
    thing.items.forEach(media => {
      if (media.items) return amazing(media)
      const itemmm = Object.assign({}, media, {images: media.images.map(image => {
        const i = Object.assign({}, base, image)
        const rotated = i.rotate % 90 === 0 && i.rotate % 360
        i.top = rotated ? i.width : 0
        i.containerwidth = rotated ? i.height : i.width
        i.containerheight = rotated ? i.width : i.height
        return i
      })})
      cell.innerHTML = mustache.render(template, itemmm)
      root.appendChild(cell.content)
    })
  }
  amazing(json)
}
