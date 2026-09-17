import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

let extractor: FeatureExtractionPipeline | null = null;

export async function getEmbeddingsGenerator() {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true,
    });
  }
  return extractor;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const generator = await getEmbeddingsGenerator();
  const output = await generator(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}
