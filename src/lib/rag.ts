import { OllamaEmbeddings } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const embeddings = new OllamaEmbeddings({
  model: "bge-m3",
  baseUrl: "http://localhost:11434",
})

export async function getContext(query: string, collection: string = "general_knowledgf") {
  try {
    const vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: collection,
      url: "http://localhost:8000",
    });
    const results = await vectorStore.similaritySearch(query, 2);
    return results.map(r => r.pageContent).join("\n\n");
  } catch (e) {
    console.log("error:",e,`提示：库 [${collection}] 暂时无法访问或为空`);
    return "";
  }
}