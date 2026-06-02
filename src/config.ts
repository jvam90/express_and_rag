import dotenv from "dotenv";

dotenv.config();

const MAX_FILE_SIZE = 10 * 1024 * 1024; //10mb

export const config = {
  openai: {
    apikey: process.env.OPENAPI_KEY || "",
  },
  qdrant: {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collection: process.env.QDRANT_COLLECTION || "documents",
  },
  server: {
    port: process.env.PORT || 3000,
  },
  uploads: {
    directory: process.env.UPLOAD_DIR || "./uploads",
    maxFileSize: MAX_FILE_SIZE,
  },
};
