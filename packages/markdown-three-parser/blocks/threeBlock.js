// blocks/threeBlock.js
// 修复1：改为工厂函数，消除模块级单例状态。
// 修复11：简化颜色处理，直接透传给 Three.js（它本身支持 CSS 颜色名、#hex、0x 格式），
//         移除错误的中间转换逻辑。
export function createThreeBlockParser() {
  let inThreeJsBlock = false
  let threeJsObjects = []

  return {
    startOrEnd(line, html) {
      const trimmed = line.trim()

      if (/^:::three\s*$/.test(trimmed)) {
        inThreeJsBlock = true;
        threeJsObjects = [];
        return true;
      }

      if (/^:::\s*$/.test(trimmed) && inThreeJsBlock) {
        html.push(
          `<div class="three-preview" data-objects='${JSON.stringify(threeJsObjects)}'></div>`
        );
        inThreeJsBlock = false;
        threeJsObjects = [];
        return true;
      }

      return false
    },

    handleObject(line) {
      if (!inThreeJsBlock) return false

      const trimmed = line.trim()
      const objectMatch = trimmed.match(
        /^(#{1,6})\s*(cube|sphere|cone|cylinder|torus|plane|dodecahedron|icosahedron|octahedron)\s*\(([^,]+?)(?:,\s*(\d+(?:\.\d+)?))?\)/i
      )

      if (objectMatch) {
        const type = objectMatch[2].toLowerCase()
        // 修复11：直接使用原始颜色字符串，Three.js 的 Color 类支持：
        // - CSS 颜色名称（'red', 'skyblue'）
        // - #RRGGBB 十六进制字符串（'#64b5f6'）
        // - 0xRRGGBB 数字字符串（Three.js Color 构造函数会处理）
        const color = objectMatch[3].trim()
        const size = parseFloat(objectMatch[4]) || 1
        threeJsObjects.push({ type, color, size })
      }
      return true
    },

    isInBlock() {
      return inThreeJsBlock
    },

    flush(html) {
      if (inThreeJsBlock) {
        // 文档末尾未闭合，强制输出已收集的对象
        html.push(
          `<div class="three-preview" data-objects='${JSON.stringify(threeJsObjects)}'></div>`
        )
        inThreeJsBlock = false
        threeJsObjects = []
      }
    }
  }
}