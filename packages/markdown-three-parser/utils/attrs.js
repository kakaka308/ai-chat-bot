// utils/attrs.js
import { escapeHTML } from './escape.js'

// 解析属性字符串（用于图片等元素）
export function parseAttrs(attrStr = '') {
  const attrs = []
  const regex = /(\w+)=(".*?"|'.*?'|[^\s"']+)/g
  let match
  while ((match = regex.exec(attrStr)) !== null) {
    const key = match[1]
    let value = match[2]
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    attrs.push(`${key}="${escapeHTML(value)}"`)
  }
  return attrs.join(' ')
}