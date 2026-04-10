// parseMarkdown.js
import { flushParagraph } from './blocks/paragraph.js'
import { handleListItem, flushList } from './blocks/list.js'
import { createTableParser } from './blocks/table.js'
import { createBlockquoteParser } from './blocks/blockquote.js'
import { handleHeading } from './blocks/heading.js'
import { createCodeBlockParser } from './blocks/codeBlock.js'
import { createMathBlockParser } from './blocks/mathBlock.js'
import { createThreeBlockParser } from './blocks/threeBlock.js'
import { renderFootnotes } from './footnotes.js'

export default function parseMarkdown(markdownText) {
  if (!markdownText) return ''

  const lines = markdownText.split('\n')
  const html = []
  const listStack = []
  const paragraphLines = []
  const footnotes = {}
  const inlineFootnotes = {}

  const codeBlock   = createCodeBlockParser()
  const mathBlock   = createMathBlockParser()
  const threeBlock  = createThreeBlockParser()
  const tableParser = createTableParser()
  const blockquote  = createBlockquoteParser()

  // 在最后推入的开始标签上注入 data-line 属性
  const injectLine = (lineNo) => {
    for (let k = html.length - 1; k >= 0; k--) {
      if (typeof html[k] === 'string' && html[k].startsWith('<') && !html[k].startsWith('</')) {
        html[k] = html[k].replace(/^(<\w+)/, `$1 data-line="${lineNo}"`)
        break
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // ====== 分割线 ======
    if (/^(\*\s*\*\s*\*|---|___)\s*$/.test(line)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      html.push('<hr />')
      injectLine(i)
      continue
    }

    // ====== 代码块 ======
    if (codeBlock.startOrEnd(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      if (!codeBlock.isInBlock()) injectLine(i)
      continue
    }
    if (codeBlock.isInBlock()) {
      codeBlock.handleLine(line)
      continue
    }

    // ====== 数学公式块 ======
    if (mathBlock.startOrEnd(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      if (!mathBlock.isInBlock()) injectLine(i)
      continue
    }
    if (mathBlock.isInBlock()) {
      mathBlock.handleLine(line)
      continue
    }

    // ====== Three.js 块 ======
    if (threeBlock.startOrEnd(line, html)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      if (!threeBlock.isInBlock()) injectLine(i)
      continue
    }
    if (threeBlock.isInBlock()) {
      threeBlock.handleObject(line)
      continue
    }

    // ====== 表格 ======
    if (line.trim().startsWith('|')) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      if (!tableParser.isInTable()) tableParser.start(i)
      tableParser.addRow(line)
      continue
    } else if (tableParser.isInTable()) {
      tableParser.parse(html)
    }

    // ====== 引用（必须在标题之前，否则 "> ## 标题" 会被标题拦截）======
    // 修复：先 flush paragraph 再调用 handle，
    // 否则引用前的段落文字不会及时输出到 html
    if (/^>/.test(line.trimStart())) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
    }
    if (blockquote.handle(line, html, i)) {
      continue
    }

    // ====== 标题 ======
    if (handleHeading(line, html, i)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      continue
    }

    // ====== 列表 ======
    if (handleListItem(line, html, listStack, i)) {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      continue
    }

    // ====== 空行 ======
    if (line.trim() === '') {
      flushParagraph(paragraphLines, html, inlineFootnotes)
      if (listStack.length > 0) flushList(html, listStack)
      blockquote.flush(html)

      let extraEmptyLines = 0
      let j = i + 1
      while (j < lines.length && lines[j].trim() === '') {
        extraEmptyLines++
        j++
      }
      for (let k = 0; k < extraEmptyLines; k++) {
        html.push('<p><br /></p>')
      }
      i = j - 1
    } else {
      paragraphLines.push({ text: line, lineNo: i })
    }
  }

  flushParagraph(paragraphLines, html, inlineFootnotes)
  flushList(html, listStack)
  blockquote.flush(html)
  if (tableParser.isInTable()) tableParser.parse(html)
  codeBlock.flush(html)
  mathBlock.flush(html)
  threeBlock.flush(html)

  renderFootnotes(html, footnotes, inlineFootnotes)

  return html.join('\n')
}