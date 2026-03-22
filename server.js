require('dotenv').config();
const express  = require('express');
const cron     = require('node-cron');
const { run }  = require('./core/engine');
const { groqChat } = require('./core/groqClient');
const analytics    = require('./core/analytics');

const app = express();
app.use(express.static('public'));
app.use(express.json());

// ── Pipeline Control ──────────────────────────────────────────────────

// Start autonomous pipeline (fire-and-forget)
app.post('/api/pipeline/run', (req, res) => {
  const config = req.body || {};
  console.log('[API] Pipeline start:', config);
  run(config).catch(console.error);
  res.json({ status: 'started', config, ts: new Date().toISOString() });
});

// Legacy GET
app.get('/run', (req, res) => {
  run().catch(console.error);
  res.json({ status: 'started' });
});

// ── Analytics ─────────────────────────────────────────────────────────

app.get('/api/analytics/summary', (req, res) => res.json(analytics.getSummary()));
app.get('/api/analytics/log',     (req, res) => res.json(analytics.getLog(parseInt(req.query.n)||50)));

// ── AI Generation via Groq (backend proxy) ────────────────────────────

app.post('/api/generate/script', async (req, res) => {
  try {
    const { niche, topic, hookStyle, platform } = req.body;
    const generator = require('./core/generator');
    const script    = await generator({ niche, topic, hookStyle, platform });
    res.json(script);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate/metadata', async (req, res) => {
  try {
    const { niche, topic, platform, excerpt } = req.body;
    const meta = await groqChat(
      `SEO expert. Generate metadata for ${platform||'both'} video. Niche: ${niche}. Topic: ${topic}. Excerpt: "${excerpt||''}".
Return JSON: {"titles":{"primary":"","alt1":"","alt2":""},"description":{"youtube":"","tiktok":""},"hashtags":{"high_volume":[],"mid_volume":[],"niche":[]},"thumbnail":{"headline":"","subtext":"","colorScheme":"","style":""},"seo":{"primaryKeyword":"","bestPostTime":"","competitionLevel":""},"viralPotential":{"score":80,"reasoning":"","suggestions":[]}}`,
      { model: 'best', maxTokens: 1500, jsonMode: true }
    );
    res.json(meta);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate/trends', async (req, res) => {
  try {
    const { niche, count = 8 } = req.body;
    const data = await groqChat(
      `Viral content trend analyst. Generate ${count} trending angles for: "${niche}".
Return JSON: {"trends":[{"topic":"","angle":"","viralReason":"","searchVolume":"high","competition":"low","estimatedViews":"50K-500K","hookIdea":"","difficulty":4}],"hotNow":["t1","t2","t3"],"nextWeek":["t1","t2"],"avoid":["o1","o2"]}`,
      { model: 'best', maxTokens: 2000, jsonMode: true }
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate/hooks', async (req, res) => {
  try {
    const { niche, topic, style, count = 10 } = req.body;
    const data = await groqChat(
      `Elite hook writer. Generate ${count} viral hooks for niche "${niche}", topic "${topic}", style "${style||'mixed'}".
Return JSON: {"hooks":[{"hook":"","style":"","viralScore":8,"whyItWorks":""}]}`,
      { model: 'best', maxTokens: 1500, jsonMode: true }
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate/captions', async (req, res) => {
  try {
    const { topic, niche, platform, tone } = req.body;
    const data = await groqChat(
      `Social media expert. Generate 5 captions for ${platform||'both'} about "${topic}" (${niche}), tone: ${tone||'engaging'}.
Return JSON: {"captions":[{"caption":"","platform":"","charCount":0,"hashtags":[],"bestTime":""}]}`,
      { model: 'best', maxTokens: 1200, jsonMode: true }
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate/hashtags', async (req, res) => {
  try {
    const { topic, niche, platform } = req.body;
    const data = await groqChat(
      `Hashtag strategist. Generate optimized hashtags for ${platform||'both'}: topic "${topic}", niche "${niche}".
Return JSON: {"high_volume":[],"mid_volume":[],"niche_specific":[],"banned":[],"recommended":"copy-paste set of 20"}`,
      { model: 'fast', maxTokens: 800, jsonMode: true }
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate/ideas', async (req, res) => {
  try {
    const { niche, count = 10 } = req.body;
    const data = await groqChat(
      `Content ideation expert. Generate ${count} unique video ideas for niche "${niche}".
Return JSON: {"ideas":[{"title":"","angle":"","hook":"","whyViral":"","difficulty":"easy","estimatedViews":"50K-200K","contentType":"educational"}]}`,
      { model: 'best', maxTokens: 2000, jsonMode: true }
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate/niche', async (req, res) => {
  try {
    const { keywords, goals } = req.body;
    const data = await groqChat(
      `Niche research expert. Analyze and recommend best niches for: keywords "${keywords}", goals "${goals||'passive income'}".
Return JSON: {"recommendations":[{"niche":"","score":85,"competition":"medium","monetization":"high","difficulty":"beginner","whyPerfect":"","topChannels":["c1","c2"],"contentPillars":["p1","p2","p3"]}],"avoid":[],"verdict":""}`,
      { model: 'best', maxTokens: 2000, jsonMode: true }
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate/competitor', async (req, res) => {
  try {
    const { channel, niche } = req.body;
    const data = await groqChat(
      `Competitor analysis expert. Analyze channel strategy for "${channel}" in niche "${niche}".
Return JSON: {"strengths":[],"weaknesses":[],"contentStrategy":"","postingFrequency":"","topFormats":[],"gapsToExploit":[],"viralFormula":"","recommendation":""}`,
      { model: 'best', maxTokens: 1500, jsonMode: true }
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate/strategy', async (req, res) => {
  try {
    const { niche, goal, timeframe } = req.body;
    const data = await groqChat(
      `Viral growth strategist. Create 90-day strategy for "${niche}" channel. Goal: ${goal||'10k followers'}. Timeframe: ${timeframe||'90 days'}.
Return JSON: {"overview":"","week1_4":{"focus":"","actions":[],"kpis":[]},"week5_8":{"focus":"","actions":[],"kpis":[]},"week9_12":{"focus":"","actions":[],"kpis":[]},"contentPillars":[],"postingSchedule":"","monetizationPath":"","tools":[],"successMetrics":[]}`,
      { model: 'best', maxTokens: 2000, jsonMode: true }
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate/calendar', async (req, res) => {
  try {
    const { niche, days = 7, platform } = req.body;
    const data = await groqChat(
      `Content calendar expert. Generate ${days}-day calendar for "${niche}" on ${platform||'both'}.
Return JSON: {"calendar":[{"day":1,"date":"Mon","topic":"","hook":"","contentType":"educational","platform":"","bestTime":"6PM","hashtags":[]}]}`,
      { model: 'best', maxTokens: 2500, jsonMode: true }
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Cron Jobs ─────────────────────────────────────────────────────────

const TIMEZONE = process.env.TIMEZONE || 'America/New_York';

// Morning batch 6 AM
cron.schedule('0 6 * * *', () => {
  console.log('[CRON] Morning pipeline');
  run().catch(console.error);
}, { timezone: TIMEZONE });

// Evening batch 7 PM (prime time)
cron.schedule('0 19 * * *', () => {
  console.log('[CRON] Evening pipeline');
  run().catch(console.error);
}, { timezone: TIMEZONE });

// Hourly heartbeat
cron.schedule('0 * * * *', () => {
  console.log(`[CRON] ♥ Alive: ${new Date().toISOString()}`);
});

// ── Start ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n⚡ BlackBox AI MAX → http://localhost:${PORT}`);
  console.log(`   GROQ: ${process.env.GROQ_API_KEY ? '✓ Postavljen' : '✗ POTREBAN — Dodaj u .env'}`);
  console.log(`   Niche: ${process.env.DEFAULT_NICHE || 'AI Tools'}`);
  console.log(`   Cron: 06:00 + 19:00 ${TIMEZONE}\n`);
});
