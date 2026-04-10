// utils/math.js
import katex from 'katex'
import { escapeHTML } from './escape.js'

export function renderMath(tex, displayMode = false) {
  try {
    return katex.renderToString(tex, {
      throwOnError: false,
      displayMode,
      output: 'html'
    })
  } catch (e) {
    return `<code class="katex-error">${escapeHTML(tex)}</code>`
  }
}