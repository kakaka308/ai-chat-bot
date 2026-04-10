// blocks/paragraph.js
// 修复：parseInline 中 protectCode 必须在 protectHTML 之前执行。
// 原来的顺序是先 protectHTML 把 <script setup> 变成占位符，
// 再 protectCode 把反引号连同占位符一起存进 codeMap，
// 导致 restoreCode 恢复出来的是 @@HTML0@@ 字符串而不是原始内容。
// 正确顺序：先 protectCode 把反引号内容整体保护，再 protectHTML 处理裸露的 HTML 标签。
import { escapeHTML, protectHTML, restoreHTML } from '../utils/escape.js'
import { protectCode, restoreCode } from '../utils/code.js'
import { renderMath } from '../utils/math.js'
import { parseAttrs } from '../utils/attrs.js'

export function parseInline(text, inlineFootnotes) {
  // Step 1: 先保护内联代码（反引号内容最优先，防止内部的 < > 被后续规则干扰）
  let { text: protectedCodeText, map: codeMap } = protectCode(text)

  // Step 2: 再保护已有的 HTML 标签（此时反引号内容已被占位符替换，不会误匹配）
  let { text: protectedHtmlText, map: htmlMap } = protectHTML(protectedCodeText)

  // Step 3: 转义普通文本中的 HTML 特殊字符
  let out = escapeHTML(protectedHtmlText)

  // Step 4: 数学公式 $...$
  out = out = protectedCodeText.replace(
    /(?<!\\)\$((?:\\\$|[^$])+?)(?<!\\)\$|\\\((.*?)\\\)/g, 
    (match, dollarExpr, bracketExpr) => {
      const expr = dollarExpr || bracketExpr;
      return renderMath(expr.trim(), false); // false 表示行内模式
    }
  );

  // Step 5: 脚注内联 [^key](content)
  out = out.replace(/\[\^(.+?)\]\((.+?)\)/g, (_, key, content) => {
    const footnoteKey = key.trim() || `inline-${Object.keys(inlineFootnotes).length + 1}`
    inlineFootnotes[footnoteKey] = escapeHTML(content)
    return `<sup id="ref-${footnoteKey}"><a href="#footnote-${footnoteKey}">${footnoteKey}</a></sup>`
  })

  // Step 6: 图片 ![alt](src){attrs}
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]*)\})?/g, (_, alt, src, attrStr) => {
    const extra = attrStr ? ' ' + parseAttrs(attrStr) : ''
    return `<img alt="${escapeHTML(alt)}" src="${escapeHTML(src)}"${extra} />`
  })

  // Step 7: 嵌入链接 [text](url){embed}
  out = out.replace(
    /\[([^\]]+?)\]\(([^)]+)\)\{embed\}/g,
    (_, linkText, url) =>
      `<iframe src="${escapeHTML(url)}" title="${escapeHTML(linkText)}" width="100%" height="400px" style="border:none;"></iframe>`
  )

  // Step 8: 普通链接 [text](url)
  out = out.replace(
    /\[([^\]]+?)\]\(([^)]+)\)/g,
    (_, linkText, url) =>
      `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" ` +
      `data-link-text="${escapeHTML(linkText)}" data-url="${escapeHTML(url)}">${escapeHTML(linkText)}</a> ` +
      `<button class="embed-toggle-btn">内嵌</button>`
  )

  // Step 9: 粗斜体 / 粗体 / 斜体 / 删除线（顺序不能乱）
  out = out.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>')
  out = out.replace(/~~([^~\n]+?)~~/g, '<del>$1</del>')

  // Step 10: 脚注引用 [^key]
  out = out.replace(
    /\[\^(.+?)\]/g,
    (_, key) => `<sup id="ref-${key}"><a href="#footnote-${key}">${key}</a></sup>`
  )

  // Step 11: 恢复被保护的代码和 HTML 标签（顺序必须是先 code 再 HTML）
  out = restoreCode(out, codeMap)
  out = restoreHTML(out, htmlMap)

  return out
}

export function flushParagraph(paragraphLines, html, inlineFootnotes) {
  if (paragraphLines.length === 0) return

  const firstLineNo = paragraphLines[0].lineNo ?? 0
  const text = paragraphLines.map(l => (typeof l === 'string' ? l : l.text)).join('\n')
  let processedText = parseInline(text, inlineFootnotes)

  processedText = processedText.replace(/\n/g, '<br />')

  html.push(`<p data-line="${firstLineNo}">${processedText}</p>`)
  paragraphLines.length = 0
}