const { groqChat } = require('./groqClient');

const HOOK_MAP = {
  contradiction: 'a bold contradiction that stops the scroll',
  secret:        'a secret nobody is talking about',
  mistake:       'a warning about a costly mistake',
  question:      'a bold rhetorical question creating instant curiosity',
  statistic:     'a shocking counterintuitive statistic',
};

module.exports = async function generator({ niche, topic, hookStyle = 'contradiction', platform = 'both' } = {}) {
  const _niche    = niche    || process.env.DEFAULT_NICHE    || 'AI Tools';
  const _platform = platform || process.env.DEFAULT_PLATFORM || 'both';

  const prompt = `You are an elite viral content strategist for faceless ${_platform} channels.
Generate a complete 60-second script for niche: "${_niche}", topic: "${topic || _niche + ' tips'}".
Hook style: ${HOOK_MAP[hookStyle] || HOOK_MAP.contradiction}.

Return this exact JSON:
{
  "title": "catchy video title",
  "hook": { "text": "0-3s hook script", "overlay": "max 5 words", "broll": "specific footage" },
  "tips": [
    { "title": "tip 1 title", "text": "3-20s script", "overlay": "overlay text", "broll": "footage" },
    { "title": "tip 2 title", "text": "20-35s script", "overlay": "overlay text", "broll": "footage" },
    { "title": "tip 3 title", "text": "35-50s script", "overlay": "overlay text", "broll": "footage" }
  ],
  "ending": { "text": "50-60s loop hook", "overlay": "overlay text", "broll": "footage" },
  "hashtags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10"],
  "description": "caption 150 chars",
  "voiceTone": "delivery instructions",
  "estimatedViews": "50K-500K",
  "viralScore": 85
}`;

  const parsed = await groqChat(prompt, { model: 'best', maxTokens: 2000, jsonMode: true });
  // Build fullText for TTS
  parsed.fullText = [
    parsed.hook?.text,
    ...(parsed.tips || []).map(t => t.text),
    parsed.ending?.text,
  ].filter(Boolean).join(' ');
  return parsed;
};
