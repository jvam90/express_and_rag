//Carrega documentos, separa em pedaços (chunks), vetoriza, etc, adiciona metadados, e insere no banco de dados vetorial
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v4 as uuidv4 } from "uuid";
import { embeddings } from "./openai.js";
import { qdrantClient } from "./qdrant.js";
import { config } from "../config.js";

interface UploadResponse {
  success: boolean;
  documentId: string;
  chunksCount: number;
  message: string;
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200, //garante que um pedaço do contexto será passado para o chunk seguinte, permitindo que o contexto não seja perdido
});

export async function processDocument(
  filePath: string,
  fileName: string,
): Promise<UploadResponse> {
  //vai retornar uma promise estruturada

  //1 - Carregar documento
  const pdfLoader = new PDFLoader(filePath);
  const documents = await pdfLoader.load(); //seria o mesmo que dizer que vai ler as páginas do documento

  if (documents.length === 0) {
    throw new Error("Nenhum documento/página encontrado(a) no arquivo PDF.");
  }

  //2 - Gerar chunks
  const chunks = await textSplitter.splitDocuments(documents);

  if (chunks.length === 0) {
    throw new Error("Nenhum chunk gerado no arquivo PDF.");
  }

  //3 - Adicionar metadados aos chunks
  const documentId = uuidv4();
  const chunksWithMetadata = chunks.map((chunk, index) => {
    return {
      id: documentId,
      text: chunk.pageContent,
      metadata: {
        documentId: documentId,
        chunkIndex: index,
        fileName: fileName,
        uploadTime: new Date().toISOString(),
        page: chunk.metadata.loc?.pageNumber,
      },
    };
  });

  //4 - Gerar embeddings
  const texts = chunksWithMetadata.map((doc) => doc.text);
  const vectors = await embeddings.embedDocuments(texts);

  //5 - Armazenar no qdrant
  const data = chunksWithMetadata.map((chunk, index) => {
    const vector = vectors[index];
    if (!vector || !Array.isArray(vector)) {
      throw new Error(`Vetor inválido gerado para o chunk de índice ${index}`);
    }

    return {
      id: chunk.id,
      vector: vector,
      payload: {
        text: chunk.text,
        ...chunk.metadata,
      },
    };
  });

  await qdrantClient.upsert(config.qdrant.collection, {
    points: data,
    wait: true,
  });

  return {
    success: true,
    documentId: documentId,
    chunksCount: chunksWithMetadata.length,
    message: "Documento processado com sucesso!",
  };
}
