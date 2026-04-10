// utils/code.js
import { escapeHTML } from './escape.js'

// 保护代码块（临时替换内联代码）
export function protectCode(str = '') {
  const codeMap = {}
  let idx = 0
  str = str.replace(/`([^`\n]+)`/g, (match, codeContent) => {
    const key = `@@CODE${idx}@@`
    codeMap[key] = codeContent
    idx++
    return key
  })
  return { text: str, map: codeMap }
}

// 恢复代码块并添加高亮类
export function restoreCode(str = '', codeMap = {}) {
  return str.replace(
    /@@CODE(\d+)@@/g,
    (_, i) =>
      `<code class="language-plaintext">${escapeHTML(codeMap[`@@CODE${i}@@`] || '')}</code>`
  )
}