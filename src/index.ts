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
  partials: {[name: string]: string}
): Render {
  const cell = container.ownerDocument.createElement('template')
  return (item: JSONValue) => {
    const html = mustache.render(template, item, partials)
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

// can i use deepdefaults here or something lodashy?
function mergeDefault(base: JSONValue, item: JSONValue): JSONValue {
  if (_.isObject(item)) return _.merge({}, base, item)
  return item || base
}

export interface RenderParams {
  container: HTMLElement
  yaml: string
  yamlFilenames: string[]
  template: string
  templateFilename: string
  partials: {[name: string]: string}
  partialFilenames: {[name: string]: string}
  transform: Transform
}

const fetchText = (filenames: string[]): Promise<string[]> =>
  Promise.all(
    filenames.map(filename => fetch(filename).then(response => response.text()))
  )

export const render = ({
  container,
  yaml = '',
  yamlFilenames = [],
  template = '{{.}}',
  templateFilename = undefined,
  partials = {},
  partialFilenames = {},
  transform = (_base, item) => item
}: Partial<RenderParams>): Promise<any> => {
  if (!container) throw new Error('Missing container.')

  const jsons: Promise<JSONValue[]> = fetchText(yamlFilenames)
    .then(yamls => [yaml, ...yamls])
    .then(yamls => yamls.map(yaml => jsyaml.safeLoad(yaml)))

  const templat = templateFilename
    ? fetchText([templateFilename]).then(templates => templates.join(''))
    : Promise.resolve(template)

  const parialz: Promise<{[name: string]: string}> = Promise.all(
    Object.entries(partialFilenames).map(([name, filename]) =>
      fetchText([filename]).then(partial => ({[name]: partial.join('')}))
    )
  ).then(partialsy => Object.assign({}, partials, ...partialsy))

  return Promise.all([jsons, templat, parialz]).then(
    ([jsons, template, partials]) =>
      jsons.forEach(json => {
        if (json) {
          renderTransform(
            {},
            json,
            renderer(container, template, partials),
            transform
          )
        }
      })
  )
}
