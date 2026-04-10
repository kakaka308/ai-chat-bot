// utils/escape.js
// 转义HTML特殊字符
export function escapeHTML(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// 保护HTML标签（临时替换为占位符）
export function protectHTML(str = '') {
  const htmlMap = {}
  let idx = 0
  str = str.replace(/<[^>]+>/g, match => {
    const key = `@@HTML${idx}@@`
    htmlMap[key] = match
    idx++
    return key
  })
  return { text: str, map: htmlMap }
}

// 恢复被保护的HTML标签
export function restoreHTML(str = '', htmlMap = {}) {
  return str.replace(/@@HTML(\d+)@@/g, (_, i) => htmlMap[`@@HTML${i}@@`] || '')
}