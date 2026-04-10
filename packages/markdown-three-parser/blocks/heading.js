// blocks/heading.js
// 修复12：正则从 {1,5} 改为 {1,6}，正确支持标准 Markdown 的全部六级标题。
// 修复：补上标题内联粗体、斜体、删除线的处理（原来只处理了数学公式）。
import { escapeHTML, protectHTML, restoreHTML } from '../utils/escape.js'
import { protectCode, restoreCode } from '../utils/code.js'
import { renderMath } from '../utils/math.js'

export function handleHeading(line, html, lineNo = 0) {
  const headingMatch = line.trim().match(/^(#{1,6})\s+(.*)/)
  if (!headingMatch) return false

  const level = headingMatch[1].length
  let content = headingMatch[2]

  // 保护 HTML 标签和内联代码，避免被后续规则干扰
  let { text: protectedHtmlText, map: htmlMap } = protectHTML(content)
  let { text: protectedCodeText, map: codeMap } = protectCode(protectedHtmlText)

  // 转义普通文本中的特殊字符
  let processedContent = escapeHTML(protectedCodeText)

  // 数学公式 $...$
  processedContent = processedContent.replace(
    /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g,
    (_, expr) => renderMath(expr, false)
  )

  // 粗斜体 / 粗体 / 斜体 / 删除线（顺序不能乱）
  processedContent = processedContent.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  processedContent = processedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  processedContent = processedContent.replace(/\*(.+?)\*/g, '<em>$1</em>')
  processedContent = processedContent.replace(/~~([^~\n]+?)~~/g, '<del>$1</del>')

  // 恢复被保护的代码和 HTML
  processedContent = restoreCode(processedContent, codeMap)
  processedContent = restoreHTML(processedContent, htmlMap)

  // 生成 id 时用原始 content（不含 HTML 标签），去掉 ** 等 Markdown 符号
  const plainText = content.trim()
    .replace(/\*{1,3}(.+?)\*{1,3}/g, '$1')   // 去掉 * 包裹
    .replace(/~~(.+?)~~/g, '$1')               // 去掉 ~~ 包裹
    .replace(/`(.+?)`/g, '$1')                 // 去掉反引号
  const id = plainText
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .toLowerCase()

  html.push(`<h${level} id="${id}" data-line="${lineNo}">${processedContent}</h${level}>`)
  return true
}