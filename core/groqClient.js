/**
 * groqClient.js — FREE Groq API client
 * Free tier: 30 req/min, 14,400 req/day
 * Models: llama-3.3-70b (best) | llama-3.1-8b (fast) | mixtral-8x7b (JSON)
 */

const axios = require('axios');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = {
  best:   'llama-3.3-70b-versatile',
  fast:   'llama-3.1-8b-instant',
  code:   'mixtral-8x7b-32768',
  backup: 'gemma2-9b-it',
};

let lastCall = 0;

async function groqChat(prompt, { model = 'best', maxTokens = 2000, temperature = 0.7, jsonMode = false } = {}) {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_key_here') throw new Error('GROQ_API_KEY nije postavljen u .env!');

  // Rate limit: max 28 req/min da ostanemo ispod free tier
  const wait = 2150 - (Date.now() - lastCall);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();

  const res = await axios.post(GROQ_URL, {
    model: MODELS[model] || model,
    messages: [
      ...(jsonMode ? [{ role: 'system', content: 'Respond with valid JSON only. No markdown, no preamble.' }] : []),
      { role: 'user', content: prompt }
    ],
    max_tokens: maxTokens,
    temperature,
    ...(jsonMode && { response_format: { type: 'json_object' } }),
  }, {
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    timeout: 30000,
  });

  const text = res.data.choices[0]?.message?.content || '';

  if (jsonMode) {
    try { return JSON.parse(text.replace(/```json|```/g, '').trim()); }
    catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) return JSON.parse(m[0]);
      throw new Error('Groq invalid JSON: ' + text.slice(0, 150));
    }
  }
  return text;
}

module.exports = { groqChat, MODELS };
