// blocks/blockquote.js
// 修复：内联内容改为复用 parseInline（和 paragraph.js 一致），
// 解决引用块内内联代码、链接、图片等内容解析错误的问题。
// 原来自己写的内联处理顺序有误（先 escapeHTML 再 protectCode），
// 导致反引号内的 < > 被转义后 protectCode 无法正确匹配，内容丢失。
import { parseInline } from './paragraph.js'

export function createBlockquoteParser() {
  let blockquoteLevel = 0

  return {
    isInBlockquote() {
      return blockquoteLevel > 0
    },

    flush(html) {
      for (let i = 0; i < blockquoteLevel; i++) {
        html.push('</blockquote>')
      }
      blockquoteLevel = 0
    },

    handle(line, html, lineNo = 0) {
      const blockquoteMatch = line.match(/^((?:>\s*)+)(.*)/)
      if (!blockquoteMatch) {
        this.flush(html)
        return false
      }

      const currentLevel = (blockquoteMatch[1].match(/>/g) || []).length
      const content = blockquoteMatch[2].trim()

      if (currentLevel > blockquoteLevel) {
        for (let i = blockquoteLevel; i < currentLevel; i++) {
          html.push(`<blockquote data-line="${lineNo}">`)
        }
      } else if (currentLevel < blockquoteLevel) {
        for (let i = blockquoteLevel; i > currentLevel; i--) {
          html.push('</blockquote>')
        }
      }
      blockquoteLevel = currentLevel

      if (content) {
        // 复用 parseInline，处理顺序和 paragraph.js 完全一致：
        // protectHTML → protectCode → escapeHTML → 各种内联规则 → restoreCode → restoreHTML
        const inlineFootnotes = {}
        const processedContent = parseInline(content, inlineFootnotes)
        html.push(`<p>${processedContent}</p>`)
      }

      return true
    }
  }
}