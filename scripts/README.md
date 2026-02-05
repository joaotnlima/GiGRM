# Traggo Video — Audio & Video Generation Guide

## Overview

The Traggo marketing video is built with [Remotion](https://remotion.dev/) and uses [ElevenLabs](https://elevenlabs.io/) for multilingual voiceovers. There are **7 scenes** across **8 language variants** (56 voiceover files total).

## Project Structure

```
GiGRM/
  public/
    bg-music.mp3                 # Background music (shared)
    vo-scene{1-7}.mp3            # English voiceovers
    vo-scene{1-7}-pt.mp3         # Portuguese (Brazil)
    vo-scene{1-7}-pt-pt.mp3      # Portuguese (Portugal)
    vo-scene{1-7}-es.mp3         # Spanish
    vo-scene{1-7}-fr.mp3         # French
    vo-scene{1-7}-it.mp3         # Italian
    vo-scene{1-7}-pl.mp3         # Polish
    vo-scene{1-7}-de.mp3         # German
    logo-white.svg               # Traggo logo (white, for dark backgrounds)
  src/remotion/
    Root.tsx                     # Composition registry
    TraggoVideo.tsx              # English
    TraggoVideoPt.tsx            # Portuguese (uses -pt-pt audio)
    TraggoVideoEs.tsx            # Spanish
    TraggoVideoFr.tsx            # French
    TraggoVideoIt.tsx            # Italian
    TraggoVideoPl.tsx            # Polish
    TraggoVideoDe.tsx            # German
  scripts/
    generate-voiceovers.py       # Voiceover generation script
```

## Generating Voiceovers

### Prerequisites

- Python 3
- `curl` (pre-installed on macOS)
- ElevenLabs API key (stored in `../.claude/settings.local.json`)

### Generate all voiceovers

```bash
cd GiGRM
python3 scripts/generate-voiceovers.py
```

### Generate for a single language

```bash
python3 scripts/generate-voiceovers.py --lang de
python3 scripts/generate-voiceovers.py --lang en
python3 scripts/generate-voiceovers.py --lang pt-pt
```

### Generate a single scene

```bash
python3 scripts/generate-voiceovers.py --scene 3          # scene 3, all languages
python3 scripts/generate-voiceovers.py --lang de --scene 3 # scene 3, German only
```

### ElevenLabs Configuration

| Setting | Value |
|---------|-------|
| **API Key** | Stored in `../.claude/settings.local.json` under `mcpServers.elevenlabs.env.ELEVENLABS_API_KEY` |
| **Model** | `eleven_multilingual_v2` |
| **Endpoint** | `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` |

### Voice IDs per Language

| Language | Voice ID | Notes |
|----------|----------|-------|
| English | `pqHfZKP75CvOlQylNhV4` | Default narrator voice |
| Portuguese (BR) | `pqHfZKP75CvOlQylNhV4` | Same voice, no language_code |
| Portuguese (PT) | `gAzaYtjDCyG4vCelULMb` | Joao PT-PT — European accent |
| Spanish | `uJOittXFsgvpY3q1g8vB` | |
| French | `b0Ev8lcOOXx2o9ZcF46H` | |
| Italian | `mENvyIA7PhaLVkVtBgsA` | |
| Polish | `lyCsVF5VHRvdLys8MaJT` | |
| German | `pqHfZKP75CvOlQylNhV4` | Uses `language_code: "de"` |

### Voice Settings

| Scene | Stability | Similarity | Style | Usage |
|-------|-----------|-----------|-------|-------|
| 1, 2, 4, 5, 6 | 0.55 | 0.80 | 0.35 | Normal narration |
| 3 (Reveal) | 0.65 | 0.85 | 0.40 | Brand reveal — slower, more dramatic |
| 7 (CTA) | 0.60 | 0.85 | 0.40 | Call to action — confident, clear |

### Scene Timing

| Scene | Start Frame | Duration | Seconds | Content |
|-------|------------|----------|---------|---------|
| 1 | 0 | 180 | 6s | WhatsApp chaos hook |
| 2 | 180 | 300 | 10s | Pain points |
| 3 | 480 | 120 | 4s | Traggo brand reveal |
| 4 | 600 | 390 | 13s | Dashboard showcase |
| 5 | 990 | 240 | 8s | Mobile app |
| 6 | 1230 | 270 | 9s | How it works |
| 7 | 1500 | 300 | 10s | CTA with pricing |

Total: 1800 frames at 30fps = 60 seconds.

## Editing Voiceover Scripts

All scripts are defined in `scripts/generate-voiceovers.py` in the `SCRIPTS` dictionary. To change what a voiceover says:

1. Edit the text in the `SCRIPTS` dict for the desired language/scene
2. Re-run the script for that language/scene:
   ```bash
   python3 scripts/generate-voiceovers.py --lang en --scene 3
   ```
3. Preview in Remotion Studio: `npm run remotion`

## Adding a New Language

1. **Add voiceover scripts** — Add a new entry to `SCRIPTS` in `generate-voiceovers.py`
2. **Add voice config** — Add the voice ID to `VOICES`, suffix to `SUFFIXES`, and optionally `LANG_CODES`
3. **Generate audio** — Run `python3 scripts/generate-voiceovers.py --lang xx`
4. **Create video component** — Copy an existing `TraggoVideo*.tsx`, translate all text strings, update audio file references to use the new suffix
5. **Register composition** — Add import and `<Composition>` entry in `Root.tsx`

## Rendering Videos

### Preview in Remotion Studio

```bash
npm run remotion
```

### Render a single composition

```bash
npx remotion render TraggoVideo       # English
npx remotion render TraggoVideoDe     # German
npx remotion render TraggoVideoEs     # Spanish
```

### Render all compositions

```bash
for comp in TraggoVideo TraggoVideoPt TraggoVideoEs TraggoVideoFr TraggoVideoIt TraggoVideoPl TraggoVideoDe; do
  echo "Rendering $comp..."
  npx remotion render "$comp" "out/${comp}.mp4"
done
```

### Render via AWS Lambda (production)

```bash
npm run deploy   # Deploy Lambda function first (one-time)
```

Then use the web UI at `/` to trigger renders via the `/api/lambda/render` endpoint.

## Brand Assets

Logo and brand assets are in `/tools/brand-assets/`:

```
tools/brand-assets/
  svg/
    logo-icon-color.svg              # Color icon (light bg)
    logo-icon-reversed-white.svg     # White icon (dark bg) — used in videos
    logo-horizontal-color.svg        # Horizontal logo (light bg)
    logo-horizontal-reversed.svg     # Horizontal logo (dark bg)
    app-icon.svg                     # App store icon
    favicon.svg                      # Browser favicon
  output/                            # Generated PNGs
  generate.py                        # PNG generation from SVGs
```

### Brand Colors in Videos

| Token | Value | Usage |
|-------|-------|-------|
| Orange | `#F97316` | CTA buttons, accents, active states |
| Teal | `#0D9488` | Traggo brand highlight (`tra`**gg**`o`) |
| Dark | `#0A0A0A` | Backgrounds |
| White | `#FFFFFF` | Text on dark |
| Green | `#10B981` | Available/success states |
| Blue | `#3B82F6` | Info/allocated states |
| Purple | `#7C3AED` | Feature accents |

### Traggo Wordmark

The brand name is rendered as: `Tra` + <span style="color:#0D9488">**gg**</span> + `o`

In JSX: `Tra<span style={{ color: C.teal }}>gg</span>o`
