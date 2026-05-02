// ─── API Route — Analyse IA 5 Éléments IEATC ─────────────────────────────────
// SSE streaming — cycle complet ZHI → HUN → SHEN → PO → SHEN Synthesis
// Avec YI comme synthétiseur d'intersaison

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  CLINICAL_SYSTEM_PROMPTS,
  YI_SYSTEM_PROMPTS,
  SHEN_SYNTHESIS_SYSTEM,
  TIER_CONFIGS,
  type AnalyseTier,
} from '@/lib/five-elements/system-prompts';
import { getCorpusForAgent } from '@/lib/five-elements/corpus';

// ─── SSE helper ──────────────────────────────────────────────────────────────

function sse(eventType: string, data: Record<string, unknown>): string {
  return `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
}

// ─── Générateur SSE du cycle complet ─────────────────────────────────────────

async function* generateCycle(
  caseText: string,
  tier: AnalyseTier,
): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const config = TIER_CONFIGS[tier];

  yield sse('start', { tier });

  const CYCLE_ORDER = ['ZHI', 'HUN', 'SHEN', 'PO'] as const;
  let context = `DONNÉES DU CAS CLINIQUE :\n\n${caseText}`;

  for (const spiritId of CYCLE_ORDER) {
    // ── Esprit principal ──────────────────────────────────────────────────────
    yield sse('spirit_start', { spirit_id: spiritId });

    const corpus = getCorpusForAgent(spiritId, caseText);
    const systemPrompt = `${CLINICAL_SYSTEM_PROMPTS[spiritId]}\n\n---\nCORPUS DE RÉFÉRENCE IEATC :\n${corpus}`;
    const modelConfig = spiritId === 'ZHI' ? config.zhi
      : spiritId === 'HUN' ? config.hun
      : spiritId === 'SHEN' ? config.shen
      : config.po;

    let output = '';

    const stream = await client.messages.create({
      model: modelConfig.model,
      max_tokens: modelConfig.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: context }],
      stream: true,
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const text = event.delta.text;
        yield sse('spirit_token', { spirit_id: spiritId, text });
        output += text;
      }
    }

    context += `\n\n---\n${spiritId} (${spiritId === 'ZHI' ? 'Eau/Rein' : spiritId === 'HUN' ? 'Bois/Foie' : spiritId === 'SHEN' ? 'Feu/Cœur' : 'Métal/Poumon'}) :\n${output}`;
    yield sse('spirit_complete', { spirit_id: spiritId });

    // ── YI Intersaison ────────────────────────────────────────────────────────
    // Après HUN → stage 1, après SHEN → stage 2, après PO → stage 3
    const yiStage =
      spiritId === 'HUN' ? 1 : spiritId === 'SHEN' ? 2 : spiritId === 'PO' ? 3 : 0;

    if (yiStage > 0) {
      yield sse('yi_start', { stage: yiStage });

      let yiOutput = '';
      const yiStream = await client.messages.create({
        model: config.yi.model,
        max_tokens: config.yi.maxTokens,
        system: YI_SYSTEM_PROMPTS[yiStage - 1],
        messages: [{ role: 'user', content: context }],
        stream: true,
      });

      for await (const event of yiStream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const text = event.delta.text;
          yield sse('yi_token', { stage: yiStage, text });
          yiOutput += text;
        }
      }

      context += `\n\n---\nYI (Terre/Rate) — Intersaison ${yiStage} :\n${yiOutput}`;
      yield sse('yi_complete', { stage: yiStage });
    }
  }

  // ── SHEN Synthèse Souveraine ──────────────────────────────────────────────
  yield sse('synthesis_start', {});

  const synthStream = await client.messages.create({
    model: config.synthesis.model,
    max_tokens: config.synthesis.maxTokens,
    system: SHEN_SYNTHESIS_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `QUESTION ORIGINALE (cas clinique) :\n\n${caseText}\n\n---\nCYCLE COMPLET :\n\n${context}`,
      },
    ],
    stream: true,
  });

  for await (const event of synthStream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield sse('synthesis_token', { text: event.delta.text });
    }
  }

  yield sse('synthesis_complete', {});
  yield sse('done', {});
}

// ─── Route GET ────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const caseText = searchParams.get('case') ?? '';
  const tierParam = searchParams.get('tier') ?? 'expert';
  const tier: AnalyseTier = ['standard', 'expert', 'supreme'].includes(tierParam)
    ? (tierParam as AnalyseTier)
    : 'expert';

  if (!caseText.trim()) {
    return new Response(JSON.stringify({ error: 'case parameter required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generateCycle(caseText, tier)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(sse('error', { message })),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
