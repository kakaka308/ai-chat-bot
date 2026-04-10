// footnotes.js
export function renderFootnotes(html, footnotes, inlineFootnotes) {
  if (
    Object.keys(footnotes).length === 0 &&
    Object.keys(inlineFootnotes).length === 0
  ) {
    return
  }

  html.push('<hr /><section class="footnotes"><ol>')

  for (const key in footnotes) {
    html.push(
      `<li id="footnote-${key}">${footnotes[key]} <a href="#ref-${key}">↩</a></li>`
    )
  }

  for (const key in inlineFootnotes) {
    html.push(
      `<li id="footnote-${key}">${inlineFootnotes[key]} <a href="#ref-${key}">↩</a></li>`
    )
  }

  html.push('</ol></section>')
}