// Calls a Hugging Face Inference endpoint with an image and returns a top-1
// label + score. Falls back to a mock classifier if no env vars are set.
//
// Expected response shapes from HF image-classification pipelines:
//   [{ label: 'plastic_bottle', score: 0.92 }, ...]
//   { label: 'plastic_bottle', score: 0.92 }
//
// Swap to your custom model by setting VITE_HF_URL + VITE_HF_TOKEN in
// .env.local. Add your model's labels to LABEL_TO_ITEM in catalog.js.

import { resolveItem } from './catalog.js';

const HF_URL = import.meta.env.VITE_HF_URL;
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

export async function classify(imageBlob) {
  if (!HF_URL) return mockClassify();

  try {
    const res = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        ...(HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {}),
        'Content-Type': imageBlob.type || 'application/octet-stream',
        Accept: 'application/json'
      },
      body: imageBlob
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HF request failed (${res.status}): ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    const top = Array.isArray(data) ? data[0] : data;
    const label = top?.label ?? top?.LABEL ?? top?.class ?? null;
    const score = top?.score ?? top?.confidence ?? 0;
    const item = resolveItem(label);
    return { item, label, confidence: score, source: 'huggingface' };
  } catch (err) {
    console.warn('[classifier] HF call failed, falling back to mock:', err);
    return mockClassify();
  }
}

function mockClassify() {
  // Weighted-ish random pool so the demo feels alive.
  const pool = [
    'plastic_bottle',
    'plastic_bottle',
    'cardboard',
    'apple_core',
    'banana_peel',
    'banana_peel',
    'coffee_grounds',
    'aluminum_can',
    'paper',
    'food',
    'battery'
  ];
  const label = pool[Math.floor(Math.random() * pool.length)];
  const item = resolveItem(label);
  const confidence = 0.78 + Math.random() * 0.18;
  return Promise.resolve({ item, label, confidence, source: 'mock' });
}
