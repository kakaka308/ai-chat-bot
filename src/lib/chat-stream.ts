/**
 * 专门负责解析 AI 返回的 SSE 流
 * @param response Fetch 的响应对象
 * @param onChunk 每解析到一个新的字符片段时的回调
 */
export async function parseAIStream(
  response: Response,
  onChunk: (delta: string) => void
) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("无法读取响应流");
  }
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine === "[DONE]" || trimmedLine === "data: [DONE]") {
        continue;
      }
      if (trimmedLine.startsWith("data:")) {
        try {
          const data = JSON.parse(trimmedLine.slice(6));
          const deltaContent = data.choices?.[0]?.delta?.content || "";
          if (deltaContent) {
            onChunk(deltaContent);
          }
        } catch (error) {
          console.error(`JSON 解析失败:`, error);
        }
      }
    }
  }
}