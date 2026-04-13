// src/lib/rag.ts
import { OllamaEmbeddings } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const embeddings = new OllamaEmbeddings({
  model: "bge-m3",
  baseUrl: "http://localhost:11434",
});

export async function getContext(query: string, collectionName: string) {
  try {
    // 关键：每次查询都重新连接指定的 collection
    const vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: collectionName,
      url: "http://localhost:8000",
    });

    // 增加一个简单的日志，帮你调试到底搜没搜到
    const results = await vectorStore.similaritySearch(query, 2);
    
    if (results.length > 0) {
      console.log(`[RAG] 在库 ${collectionName} 中找到了 ${results.length} 条匹配内容`);
      return results.map(r => r.pageContent).join("\n\n");
    }
    
    return "";
  } catch (e) {
    // 如果库不存在（比如还没录入过），Chroma 可能会抛错，这里返回空即可
    console.log(`[RAG] 库 ${collectionName} 暂时不存在或查询失败`);
    return "";
  }
}