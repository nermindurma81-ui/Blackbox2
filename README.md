# BlackBox AI MAX 🤖

> Autonomous AI short video factory with full ShortAI UI — 16 tools in one dashboard.

**Engine:** Groq (llama-3.3-70b FREE) · StreamElements TTS (FREE) · FFmpeg  
**UI:** Generator Skripti · Viral Hook Lab · Trend Radar · Niša Finder · Caption Lab · Hashtag Engine · Competitor Analiza · Viral Strategija · Content Kalendar · Analytics · Auto Pipeline

---

## 🚀 Pokretanje (3 koraka)

```bash
# 1. Instaliraj dependencies
npm install

# 2. Instaliraj sistem tools
pip install edge-tts          # alternativni TTS (opcionalno)
sudo apt install ffmpeg       # Linux
# ili: brew install ffmpeg    # Mac

# 3. Dodaj Groq API ključ i pokreni
node server.js
# → http://localhost:3000
```

---

## ⚙️ API Ključevi

Idi na **http://localhost:3000** → klikni **API Ključevi** u sidebaru.

| Ključ | Gdje dobiti | Limit | Obavezno |
|---|---|---|---|
| **Groq** | [console.groq.com](https://console.groq.com) | 30 req/min, 14.400/dan | ✅ DA |
| YouTube | [console.cloud.google.com](https://console.cloud.google.com) | free quota | ❌ za upload |
| TikTok | [developers.tiktok.com](https://developers.tiktok.com) | free | ❌ za upload |

> **Ključevi se čuvaju u tvom browseru (localStorage)** — ne idu na server.

---

## 🛠️ Svih 16 alata

### Studio
| Alat | Opis |
|---|---|
| **Početna** | Dashboard + Quick Run pipeline |
| **Batch Generator** | 2–10 videa odjednom |

### Idea Lab
| Alat | Opis |
|---|---|
| **Generator Ideja** | 10 unique video ideja za nišu |
| **Viral Hook Lab** | 10 hookova s viral score-om |
| **Niša Finder** | Preporuke niše po interesima |

### Script Lab
| Alat | Opis |
|---|---|
| **Generator Skripti** | Kompletna 60s skripta (hook+3 tips+ending+b-roll+overlay) |
| **Caption Lab** | 5 platform-optimiziranih captiona |
| **Hashtag Engine** | High/mid/niche hashtagovi + "izbjegaj" lista |

### Growth Lab
| Alat | Opis |
|---|---|
| **Trend Radar** | Trending topics + Hot Now + Next Week + Avoid |
| **Content Kalendar** | 7/14/30-dnevni plan → CSV export |
| **Competitor Analiza** | Strategija konkurencije + gaps to exploit |
| **Viral Strategija** | 90-dnevni plan rasta |

### Sistem
| Alat | Opis |
|---|---|
| **Analytics** | Log svih generisanih videa |
| **Auto Pipeline** | Ručno pokretanje + status |
| **API Ključevi** | UI za sve ključeve (browser storage) |

---

## 🤖 Auto Pipeline

Pipeline se pokreće automatski **dva puta dnevno** (06:00 + 19:00):

```
Groq AI → Skripta
  ↓
StreamElements TTS → MP3 naracija
  ↓
captions.js → SRT titlovi
  ↓
FFmpeg → MP4 1080×1920 (s text overlayima)
  ↓
uploader.js → YouTube / TikTok (enable u kodu)
  ↓
analytics.log → Statistike
```

**Ručno pokretanje:**
```bash
# Iz UI: Početna → POKRENI PIPELINE
# Iz terminala:
node bots/autoPipeline.js --niche "AI Tools" --count 3
node bots/autoPipeline.js --niche "Finance" --count 2 --dry-run
```

**Standalone scheduler (bez servera):**
```bash
node bots/scheduler.js
# → 06:00, 12:00, 19:00 automatic runs
```

---

## 📁 Struktura

```
blackbox-max/
├── server.js              ← Express + cron + sve API rute
├── package.json
├── .env                   ← API ključevi (server-side)
├── core/
│   ├── engine.js          ← Glavni pipeline
│   ├── groqClient.js      ← Groq API (rate limiting)
│   ├── generator.js       ← AI skripta generacija
│   ├── scorer.js          ← Viral score filtar
│   ├── voice.js           ← StreamElements TTS → MP3
│   ├── video.js           ← FFmpeg → MP4 1080×1920
│   ├── captions.js        ← SRT titlovi
│   ├── monetizer.js       ← Dodaje promo link
│   ├── uploader.js        ← YouTube upload (template)
│   └── analytics.js       ← analytics.log read/write
├── bots/
│   ├── autoPipeline.js    ← CLI pipeline runner
│   └── scheduler.js       ← Standalone cron
├── public/
│   └── index.html         ← Kompletan dashboard (16 alata)
└── output/                ← MP3, MP4, SRT fajlovi
```

---

## 🔧 Konfiguracija (.env)

```env
GROQ_API_KEY=gsk_xxx         # Obavezno
PORT=3000
DEFAULT_NICHE=AI Tools
DEFAULT_PLATFORM=both        # both | youtube | tiktok
DAILY_VIDEO_COUNT=3
TIMEZONE=America/New_York
PROMO_LINK=https://yourlink.com
```

---

## 🐛 Troubleshooting

**`GROQ_API_KEY nije postavljen`** → Idi u API Ključevi u UI i dodaj ključ  
**FFmpeg error** → `sudo apt install ffmpeg` ili `brew install ffmpeg`  
**TTS tih** → StreamElements je free fallback; za bolji glas instaliraj `edge-tts` (`pip install edge-tts`)  
**Rate limit 429** → groqClient.js automatski čeka 2.1s između poziva; ako persistira, smanjio si `DAILY_VIDEO_COUNT`  
**Output fajlovi** → nalaze se u `/output/` folderu (ID = Unix timestamp)
