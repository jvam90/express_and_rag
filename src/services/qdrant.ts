import { config } from "../config.js";
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrantClient = new QdrantClient({
  url: config.qdrant.url,
});

//Criar uma coleção no qdrant ao inicializar a API, se ela não existir
export async function initQdrantCollection() {
  const collections = await qdrantClient.getCollections();
  const collectionName = config.qdrant.collection;
  const exists = collections.collections.find((col) => {
    col.name === collectionName;
  });

  if (!exists) {
    await qdrantClient.createCollection(collectionName, {
      vectors: {
        size: 1536,
        distance: "Cosine",
      },
    });

    console.log(`${collectionName} criada no qdrant`);
  } else {
    console.log(`${collectionName} já existente no qdrant`);
  }
}
