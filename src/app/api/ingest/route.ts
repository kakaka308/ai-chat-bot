// src/app/api/ingest/route.ts
import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/ollama";

export async function POST(req: Request) {
  try {
    const { text, collectionName } = await req.json();

    if (!text || !collectionName) {
      return NextResponse.json({ error: "缺少文本或库名" }, { status: 400 });
    }

    // 1. 初始化本地翻译官
    const embeddings = new OllamaEmbeddings({
      model: "bge-m3",
      baseUrl: "http://localhost:11434",
    });

    // 2. 切分文本
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    
    // 把纯文本包装成文档对象
    const docs = await splitter.createDocuments([text]);

    // 3. 存入 Chroma
    await Chroma.fromDocuments(docs, embeddings, {
      collectionName: collectionName,
      url: "http://localhost:8000",
    });

    return NextResponse.json({ success: true, message: `已成功存入 ${collectionName}` });

  } catch (error) {
    console.error("录入失败:", error);
    return NextResponse.json({ error: "录入失败" }, { status: 500 });
  }
}