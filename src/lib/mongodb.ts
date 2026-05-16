import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB || "my-ai-chat";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

async function connectToDatabase() {
  if (client) {
    return { client, db: client.db(DB_NAME) };
  }

  client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("[MongoDB] 连接成功");
  return { client, db: client.db(DB_NAME) };
}

export { connectToDatabase };
