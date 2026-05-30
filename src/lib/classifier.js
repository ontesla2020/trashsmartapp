// Calls the user's Hugging Face Space (Gradio) for waste classification.
//
// The Space exposes a Gradio `consumer_predict` endpoint that returns
//   [annotated_image, clean_image, markdown_string]
// where markdown_string contains either:
//   "### Identified: **Plastic Bottle**\n...Model confidence: **92.1%**"
// or, for low confidence:
//   "Closest guess: plastic bottle (38%)"
//
// We pull the class + confidence out of the markdown and resolve to a
// catalog item.

import { Client } from '@gradio/client';
import { resolveItem } from './catalog.js';

const HF_SPACE = import.meta.env.VITE_HF_SPACE || 'ontesla2020/trashsmartapp1';
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

// Human-readable arm label for the A/B test. Falls back to inferring from
// the Space name if unset.
export const MODEL_ARM =
  import.meta.env.VITE_MODEL_ARM ||
  (HF_SPACE.endsWith('trashsmartapp2') ? 'B · YOLO-only' : 'A · two-stage');
export const MODEL_SPACE = HF_SPACE;

let clientPromise = null;
function getClient() {
  if (!clientPromise) {
    const opts = HF_TOKEN ? { hf_token: HF_TOKEN } : {};
    clientPromise = Client.connect(HF_SPACE, opts).catch((err) => {
      clientPromise = null; // allow retry on next call
      throw err;
    });
  }
  return clientPromise;
}

// Cold-start the Space connection in the background as soon as this module
// loads, so the first scan doesn't have to wait for the WebSocket handshake.
if (typeof window !== 'undefined') {
  setTimeout(() => {
    getClient().catch(() => {});
  }, 500);
}

export async function classify(imageBlob) {
  try {
    const client = await getClient();
    // Use the named endpoint + named parameter (the Space's API docs show
    // it as `/consumer_predict` with one input named `pil_img`). Calling by
    // index 0 stopped working in Arm B because Gradio registers the same
    // function twice (consumer_predict and consumer_predict_1), so the
    // positional fallback is ambiguous.
    const result = await client.predict('/consumer_predict', {
      pil_img: imageBlob
    });

    // DEBUG: log the raw Space response so we can see Arm B's actual format
    // when diagnosing parser mismatches. Safe to leave in — useful for the
    // A/B test logs anyway.
    console.log('[classifier] raw Space response:', result?.data);

    const markdown = Array.isArray(result?.data) ? result.data[2] : null;
    if (!markdown) throw new Error('Gradio Space returned no markdown payload.');

    console.log('[classifier] markdown payload:', markdown);

    const parsed = parseConsumerMarkdown(markdown);
    if (!parsed.label) throw new Error('Could not extract class from markdown.');

    const item = resolveItem(parsed.label);
    return {
      item,
      label: parsed.label,
      confidence: parsed.confidence,
      uncertain: parsed.uncertain,
      source: 'huggingface-space',
      arm: MODEL_ARM,
      space: MODEL_SPACE
    };
  } catch (err) {
    console.warn(
      '[classifier] HF Space call failed, falling back to mock.',
      'message:', err?.message,
      'name:', err?.name,
      'full:', err
    );
    return mockClassify();
  }
}

// Parses the Gradio Space's consumer_predict markdown.
// Returns { label, confidence (0-1), uncertain (bool) }.
export function parseConsumerMarkdown(md) {
  let label = null;
  let confidence = 0;
  let uncertain = false;

  // Confident path: "### Identified: **Plastic Bottle**"
  // Note: app.py does `cls.replace("_", " ").title()` so we reverse it.
  const identified = md.match(/Identified:\s*\*\*([^*]+)\*\*/i);
  if (identified) {
    label = identified[1].toLowerCase().trim().replace(/\s+/g, '_');
  } else {
    // Low-confidence path: "Closest guess: plastic bottle (38%)"
    const guess = md.match(/Closest\s+guess:\s*([^()\n]+?)\s*\(/i);
    if (guess) {
      label = guess[1].toLowerCase().trim().replace(/\s+/g, '_');
      uncertain = true;
    }
  }

  // Confidence: "Model confidence: **92.1%**" or "(38%)"
  const confExplicit = md.match(/Model\s+confidence:\s*\*\*([\d.]+)\s*%\*\*/i);
  const confInline = md.match(/\(([\d.]+)\s*%\)/);
  const raw = confExplicit?.[1] || confInline?.[1];
  if (raw) confidence = parseFloat(raw) / 100;

  return { label, confidence, uncertain };
}

// ===== Inspector mode =====
// Calls the Space's `/inspector_predict` endpoint, which returns:
//   [annotated_image, clean_image, markdown_with_embedded_json]
// We extract a JSON payload that the Space embeds inside an HTML comment
// like <!--INSPECTOR_DATA {...} INSPECTOR_DATA--> so we get a structured
// list of detections + a contamination score without re-parsing pretty
// markdown.

export async function inspect(imageBlob, targetStream = 'recycle') {
  try {
    const client = await getClient();
    const result = await client.predict('/inspector_predict', {
      pil_img: imageBlob,
      target_stream: targetStream
    });

    console.log('[inspector] raw Space response:', result?.data);

    const markdown = Array.isArray(result?.data) ? result.data[2] : null;
    if (!markdown) throw new Error('Inspector Space returned no markdown.');

    console.log('[inspector] markdown payload:', markdown);

    const match = markdown.match(/<!--INSPECTOR_DATA\s*([\s\S]*?)\s*INSPECTOR_DATA-->/);
    if (!match) throw new Error('No INSPECTOR_DATA payload in markdown.');

    const data = JSON.parse(match[1]);
    return {
      ...data,
      source: 'huggingface-space',
      arm: MODEL_ARM,
      space: MODEL_SPACE
    };
  } catch (err) {
    console.warn(
      '[inspector] call failed, falling back to mock.',
      'message:', err?.message,
      'name:', err?.name,
      'full:', err
    );
    return mockInspect(targetStream);
  }
}

function mockInspect(targetStream) {
  const items = [
    { label: 'plastic_bottle', conf: 0.87, stream: 'recycle' },
    { label: 'banana_peel',    conf: 0.65, stream: 'organic' },
    { label: 'cardboard',      conf: 0.79, stream: 'recycle' },
    { label: 'plastic_film',   conf: 0.42, stream: 'trash' }
  ].map((i) => ({ ...i, clean: i.stream === targetStream }));

  const totalConf = items.reduce((a, b) => a + b.conf, 0) || 1;
  const cleanConf = items.filter((i) => i.clean).reduce((a, b) => a + b.conf, 0);
  const purity = cleanConf / totalConf;
  const contamination = 1 - purity;
  const grade =
    purity >= 0.9 ? 'A' : purity >= 0.75 ? 'B' : purity >= 0.6 ? 'C' : purity >= 0.4 ? 'D' : 'F';

  return Promise.resolve({
    target: targetStream,
    items,
    counts: {
      clean: items.filter((i) => i.clean).length,
      contaminated: items.filter((i) => !i.clean).length
    },
    purity: parseFloat(purity.toFixed(3)),
    contamination: parseFloat(contamination.toFixed(3)),
    grade,
    source: 'mock',
    arm: 'mock',
    space: null
  });
}

function mockClassify() {
  const pool = [
    'plastic_bottle',
    'plastic_bottle',
    'cardboard',
    'organic_food',
    'organic_food',
    'metal_can',
    'paper',
    'glass_bottle',
    'hazardous'
  ];
  const label = pool[Math.floor(Math.random() * pool.length)];
  const item = resolveItem(label);
  const confidence = 0.78 + Math.random() * 0.18;
  return Promise.resolve({
    item,
    label,
    confidence,
    uncertain: false,
    source: 'mock',
    arm: 'mock',
    space: null
  });
}
