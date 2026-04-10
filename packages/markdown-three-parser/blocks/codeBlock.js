// blocks/codeBlock.js
// 修复：改为工厂函数，每次 parseMarkdown 调用时创建独立状态，
// 彻底消除模块级单例状态导致的跨次解析污染 Bug。
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-python.js'
import 'prismjs/components/prism-css.js'
import 'prismjs/components/prism-markup.js'

export function createCodeBlockParser() {
  let inCodeBlock = false
  let codeLang = 'text'
  let codeLines = []

  return {
    startOrEnd(line, html) {
      const trimmed = line.trim()
      if (!/^```/.test(trimmed)) return false

      if (inCodeBlock) {
        // 代码块结束
        const codeContent = codeLines.join('\n')
        const highlighted = Prism.highlight(
          codeContent,
          Prism.languages[codeLang] || Prism.languages.plain,
          codeLang
        )
        html.push(`<pre class="language-${codeLang}"><code>${highlighted}</code></pre>`)
        inCodeBlock = false
        codeLines = []
      } else {
        // 代码块开始
        inCodeBlock = true
        codeLang = trimmed.slice(3).trim() || 'text'
        codeLines = []
      }
      return true
    },

    handleLine(line) {
      if (!inCodeBlock) return false
      codeLines.push(line)
      return true
    },

    isInBlock() {
      return inCodeBlock
    },

    // 文档末尾若代码块未闭合，强制关闭
    flush(html) {
      if (inCodeBlock) {
        const codeContent = codeLines.join('\n')
        const highlighted = Prism.highlight(
          codeContent,
          Prism.languages[codeLang] || Prism.languages.plain,
          codeLang
        )
        html.push(`<pre class="language-${codeLang}"><code>${highlighted}</code></pre>`)
        inCodeBlock = false
        codeLines = []
      }
    }
  }
}