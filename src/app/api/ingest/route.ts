import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
// 只保留 PDFLoader，因为它内部逻辑较复杂，建议保留使用
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

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

    // --- 核心修复：处理逻辑优化 ---
    if (file) {
      if (file.name.endsWith(".pdf")) {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // 关键修改：传入第二个参数 { splitPages: false } 
        // 或者尝试传入自定义的 pdfjs (如果仍然报错)
        const loader = new PDFLoader(new Blob([buffer]), {
          splitPages: true, // 保持分页
          // 有时需要显式禁用 pdf-parse 的某些默认行为来跳过路径检查
        });
        
        const rawDocs = await loader.load();
        docs = await splitter.splitDocuments(rawDocs);
      } else {
        // 对于 .txt, .md 等文本文件，直接用 file.text() 读取字符串
        // 这不需要任何额外的 Loader，兼容性最强
        const content = await file.text();
        docs = await splitter.createDocuments([content], [{ source: file.name }]);
      }
    } else if (text) {
      // 处理手动粘贴的文本
      docs = await splitter.createDocuments([text], [{ source: "manual_input" }]);
    }
    // ----------------------------

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
    const cleanedDocs = docs.map(doc => {
      const newMetadata: Record<string, string | number | boolean | null> = {};
      // 遍历元数据，只保留 Chroma 支持的简单类型
      for (const [key, value] of Object.entries(doc.metadata)) {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          value === null
        ) {
          newMetadata[key] = value;
        } else {
          // 如果是复杂对象（比如 pdf 属性），将其转换为字符串或者直接丢弃
          newMetadata[key] = JSON.stringify(value); 
        }
      }

      return {
        ...doc,
        metadata: newMetadata,
      };
    });

    // 使用清理后的文档
    await vectorStore.addDocuments(cleanedDocs);

    return NextResponse.json({ success: true, count: cleanedDocs.length });
  } catch (error) {
    console.error("录入失败:", error);
    return NextResponse.json({ error: "内部服务器错误" }, { status: 500 });
  }
}