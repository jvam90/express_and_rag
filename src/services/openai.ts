import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { config } from "../config.js";

const openApikey = config.openai.apikey;

//Vetorização dos textos
export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: openApikey,
  model: "text-embedding-3-small",
  maxRetries: 2,
  timeout: 10000,
});

//Processamento das mensagens (prompts)
export const llm = new ChatOpenAI({
  apiKey: openApikey,
  model: "gpt-4o-mini",
  temperature: 0,
  maxRetries: 2,
  timeout: 20000,
});
