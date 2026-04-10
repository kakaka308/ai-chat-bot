// blocks/mathBlock.js
// 修复：改为工厂函数，消除模块级单例状态。
import { renderMath } from '../utils/math.js'

export function createMathBlockParser() {
  let inMathBlock = false
  let mathBlockLines = []
  let endTag = ''
  return {
    startOrEnd(line, html) {
      const trimmed = line.trim()
      // 如果已经在块内，检查是否遇到了对应的结束标记
      if (inMathBlock) {
        if (trimmed === endTag) {
          html.push(renderMath(mathBlockLines.join('\n'), true))
          inMathBlock = false
          mathBlockLines = []
          return true
        }
        return false
      }

      // 检查开始标记
      if (trimmed === '$$') {
        inMathBlock = true
        endTag = '$$'
        mathBlockLines = []
        return true
      } else if (trimmed === '\\[' || trimmed === '$$$') { // 兼容 \[
        inMathBlock = true
        endTag = (trimmed === '\\[') ? '\\]' : '$$$'
        mathBlockLines = []
        return true
      }
      return false
    },

    handleLine(line) {
      if (!inMathBlock) return false
      mathBlockLines.push(line)
      return true
    },

    isInBlock() {
      return inMathBlock
    },

    flush(html) {
      if (inMathBlock) {
        html.push(renderMath(mathBlockLines.join('\n'), true))
        inMathBlock = false
        mathBlockLines = []
      }
    }
  }
}