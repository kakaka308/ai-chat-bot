import { OllamaEmbeddings } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const embeddings = new OllamaEmbeddings({
  model: "bge-m3",
  baseUrl: "http://localhost:11434",
});
// 单个知识库检索
export async function getContext(query: string, collectionName: string) {
  try {
    const vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: collectionName,
      url: "http://localhost:8000",
    });
    const results = await vectorStore.similaritySearch(query, 2);
    if (results.length > 0) {
      console.log(`[RAG] 在库 ${collectionName} 中找到了 ${results.length} 条匹配内容`);
      return results.map(r => r.pageContent).join("\n\n");
    }
    return "";
  } catch (e) {
    console.log(e,`[RAG] 库 ${collectionName} 暂时不存在或查询失败`);
    return "";
  }
}
// 多库并行检索
export async function getFullContext(query: string) {
  const collections = ["diary_assistant", "general_knowledge", "my_3d_knowledge"];
  const [diary, general, three] = await Promise.all(
    collections.map(col => getContext(query, col))
  );

  return {
    text: `
      来自日记：${diary || "无相关记录"}
      来自通用库：${general || "无相关记录"}
      来自3D库：${three || "无相关记录"}
    `,
    hasData: !!(diary || general || three)
  };
}