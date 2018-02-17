import * as _ from 'lodash'
import * as jsyaml from 'js-yaml'
import * as mustache from 'mustache'
import {JSONValue} from './json'

interface Render {
  (item: JSONValue): void
}

interface Transform {
  (base: JSONValue, item: JSONValue): JSONValue
}

function renderer(
  container: HTMLElement,
  template: string,
  _partials: string[]
): Render {
  const cell = container.ownerDocument.createElement('template')
  return (item: JSONValue) => {
    const html = mustache.render(template, item, {
      polaroid: `<div class=polaroid-container>
        <img class=polaroid-image src='{{url}}'>
        <div class=polaroid-caption-container>
          <div class=polaroid-caption>{{title}}</div>
        </div>
      </div>`
    })
    if (html) {
      cell.innerHTML = html
      container.appendChild(cell.content)
    }
  }
}

function renderTransform(
  base: JSONValue,
  root: any,
  render: Render,
  transform: Transform
) {
  base = _.merge({}, base, root.default)
  root.items.forEach((item: JSONValue) => {
    const result: any = mergeDefault(base, transform(base, item))
    render(result)
    if (result.items) renderTransform(base, result, render, transform)
  })
}

function iterate(
  yaml: string,
  container: HTMLElement,
  template: string,
  partials: string[],
  transform: (base: JSONValue, item: JSONValue) => JSONValue
): void {
  const json = jsyaml.safeLoad(yaml)
  // babel if js
  // ([partials] || []).map(partial =>
  //console.log(`../demo/templates/${partial}`))
  renderTransform({}, json, renderer(container, template, partials), transform)
}

// can i use deepdefaults here or something lodashy?
function mergeDefault(base: JSONValue, item: JSONValue): JSONValue {
  if (_.isObject(item)) return _.merge({}, base, item)
  return item || base
}

function identity(_base: JSONValue, item: JSONValue): JSONValue {
  return item
}

export function simple(
  yaml: string,
  container: HTMLElement,
  template: string,
  ...partials: string[]
): void {
  iterate(yaml, container, template, partials, identity)
}

export function renderFile(): void {}

export function render(
  yaml: string,
  container: HTMLElement,
  template: string,
  ...partials: string[]
): void {
  iterate(yaml, container, template, partials, (base: any, item: any) => {
    return Object.assign({}, item, {
      images: (item.images || []).map((image: JSONValue) => {
        const i = Object.assign({}, base.image, image)
        const rotated = i.rotate % 90 === 0 && i.rotate % 360
        i.top = rotated ? i.width : 0
        i.containerwidth = rotated ? i.height : i.width
        i.containerheight = rotated ? i.width : i.height
        return i
      })
    })
  })
}
