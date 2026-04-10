// blocks/list.js
// 修复：普通列表项内联内容改为复用 parseInline（和 paragraph.js 一致），
// 解决列表项内反引号代码、链接、粗体等内容解析错误的问题。
// 任务列表的 checkbox 文字部分同样使用 parseInline 处理。
import { parseInline } from './paragraph.js'

export function flushList(html, listStack) {
  while (listStack.length > 0) {
    const { tag } = listStack.pop()
    html.push(`</${tag}>`)
  }
}

export function handleListItem(line, html, listStack, lineNo = 0) {
  const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)/)
  if (!match) return false

  const indent = match[1].length
  const marker = match[2]
  const content = match[3]
  const level = indent === 0 ? 0 : Math.ceil(indent / 2);
  const isOrdered = /^\d+\./.test(marker)
  const currentTag = isOrdered ? 'ol' : 'ul'

  while (listStack.length > level + 1) {
    const { tag } = listStack.pop()
    html.push(`</${tag}>`)
  }

  if (listStack.length <= level) {
    listStack.push({ tag: currentTag, indent })
    html.push(`<${currentTag}>`)
  } else if (listStack[listStack.length - 1].tag !== currentTag) {
    const { tag } = listStack.pop()
    html.push(`</${tag}>`)
    listStack.push({ tag: currentTag, indent })
    html.push(`<${currentTag}>`)
  }

  // 任务列表需要先检测 [ ] / [x]，在保护代码之前匹配原始文本
  const taskMatch = content.match(/^\[( |x|X)\]\s+(.*)/)

  if (taskMatch) {
    const checked = taskMatch[1].toLowerCase() === 'x'
    // 任务文字部分也用 parseInline 处理，支持内联代码、粗体等
    const inlineFootnotes = {}
    const text = parseInline(taskMatch[2], inlineFootnotes)
    html.push(
      `<li data-line="${lineNo}" data-task="true">` +
      `<input type="checkbox" ${checked ? 'checked' : ''} data-line="${lineNo}"> ${text}</li>`
    )
  } else {
    // 普通列表项：复用 parseInline，处理顺序与 paragraph.js 完全一致
    const inlineFootnotes = {}
    const processedContent = parseInline(content, inlineFootnotes)
    html.push(`<li data-line="${lineNo}">${processedContent}</li>`)
  }

  return true
}