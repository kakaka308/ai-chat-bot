import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChromaClient } from "chromadb";


const client = new ChromaClient({
  path: "http://localhost:8000",
});
// 获取知识库列表
export async function GET() { 
  try {
    const collections = await client.listCollections();
    const detailList = await Promise.all(
      collections.map(async (collectionName) => {
        const collection = await client.getCollection({
          name: collectionName.name,
        });
        const count = await collection.count();
        return {
          name: collectionName.name,
          count,
        };
      })
    );
    return NextResponse.json(detailList);
  } catch (error) {
    console.error("获取知识库列表失败:", error);
    return NextResponse.json({ error: "内部服务器错误" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    const collectionName = (formData.get("collectionName") as string) || "general_knowledge";

    let docs: Document[] = [];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 600,
      chunkOverlap: 100,
    });

    // 多格式数据处理
    if (file) {
      // PDF
      if (file.name.endsWith(".pdf")) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const loader = new PDFLoader(new Blob([buffer]), {
          splitPages: true, // 分页
        });
        const rawDocs = await loader.load();
        docs = await splitter.splitDocuments(rawDocs);
      } else {
        // txt, md 
        const content = await file.text();
        docs = await splitter.createDocuments([content], [{ source: file.name }]);
      }
    } else if (text) {
      // 手动粘贴的文本
      docs = await splitter.createDocuments([text], [{ source: "manual_input" }]);
    }

    // 向量化准备
    if (docs.length === 0) {
      return NextResponse.json({ error: "内容为空" }, { status: 400 });
    }
    const embeddings = new OllamaEmbeddings({
      model: "bge-m3",
      baseUrl: "http://localhost:11434",
    });
    const vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName,
      url: "http://localhost:8000",
    });
    // 元数据清洗
    const cleanedDocs = docs.map(doc => {
      const newMetadata: Record<string, string | number | boolean | null> = {};
      // Chroma 只支持简单类型
      for (const [key, value] of Object.entries(doc.metadata)) {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          value === null
        ) {
          newMetadata[key] = value;
        } else {
          // 如果是复杂对象转换为字符串
          newMetadata[key] = JSON.stringify(value); 
        }
      }

      return {
        ...doc,
        metadata: newMetadata,
      };
    });

    await vectorStore.addDocuments(cleanedDocs);

    return NextResponse.json({ success: true, count: cleanedDocs.length });
  } catch (error) {
    console.error("录入失败:", error);
    return NextResponse.json({ error: "内部服务器错误" }, { status: 500 });
  }
}

