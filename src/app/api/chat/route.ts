
import OpenAI from "openai";
import { getContext } from  "@/lib/rag";
import { getSystemPrompt } from "@/lib/prompts";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
})

export const tuntione =  "edge";

export async function POST(req: Request) {
  const { messages } =  await req.json();
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "get_local_knowledge",
        description: "检索个人日记、3D模型指令或通用文档。当用户询问具体事实、过去记录或3D操作建议时调用。",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "搜索关键词" },
            category: { 
              type: "string", 
              enum: ["diary_assistant", "general_knowledge", "my_3d_knowledge"],
              description: "库分类"
            },
          },
          required: ["query", "category"],
        },
      },
    },
  ];
  // 第一次请求：判断意图
  const response = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: getSystemPrompt("") },
      ...messages
    ],
    tools,
    tool_choice: "auto",
  });
  const firstMsg = response.choices[0].message;
  let finalStreamResponse;
  if (firstMsg.tool_calls && firstMsg.tool_calls.length > 0) {
    const toolMsgs: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [...messages, firstMsg];
    
    for(const toolCall of firstMsg.tool_calls) {
      if (toolCall.type === 'function') {
        const { query, category } = JSON.parse(toolCall.function.arguments);
        const context = await getContext(query, category);

        toolMsgs.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: context || "未找到相关内容",
        } as OpenAI.Chat.Completions.ChatCompletionToolMessageParam);
      }
    }

    // 第二次请求：结合工具结果生成最终回答
    finalStreamResponse = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: toolMsgs,
      stream: true,
    });
  } else {
    // 普通对话逻辑
    finalStreamResponse = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "system", content: getSystemPrompt("") }, ...messages],
      stream: true,
    });
  }
  

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of finalStreamResponse) {
        // 构建符合 SSE 格式的字符串：data: {"choices": [...]}
        const text = `data: ${JSON.stringify(chunk)}\n\n`;
        controller.enqueue(encoder.encode(text));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}