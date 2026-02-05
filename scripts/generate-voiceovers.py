#!/usr/bin/env python3
"""
Traggo Marketing Video — Voiceover Generator
Uses ElevenLabs TTS API (eleven_multilingual_v2) to generate
all scene voiceovers for every supported language.

Usage:
  python3 scripts/generate-voiceovers.py              # generate all
  python3 scripts/generate-voiceovers.py --lang de     # only German
  python3 scripts/generate-voiceovers.py --scene 3     # only scene 3, all langs
  python3 scripts/generate-voiceovers.py --lang de --scene 3  # single file
"""

import argparse
import json
import os
import subprocess
import sys
import time

# ─── Config ──────────────────────────────────────────────────────────────
API_KEY = "sk_b08921a99fb477b018920b8108d6d79067c92bfaad304452"
API_URL = "https://api.elevenlabs.io/v1/text-to-speech"
MODEL = "eleven_multilingual_v2"
PUB = os.path.join(os.path.dirname(__file__), "..", "public")

# Voice IDs per language (ElevenLabs voice clones / library voices)
VOICES = {
    "en":    "pqHfZKP75CvOlQylNhV4",
    "pt":    "pqHfZKP75CvOlQylNhV4",
    "pt-pt": "gAzaYtjDCyG4vCelULMb",  # Joao PT-PT — European Portuguese accent
    "es":    "uJOittXFsgvpY3q1g8vB",
    "fr":    "b0Ev8lcOOXx2o9ZcF46H",
    "it":    "mENvyIA7PhaLVkVtBgsA",
    "pl":    "lyCsVF5VHRvdLys8MaJT",
    "de":    "pqHfZKP75CvOlQylNhV4",  # multilingual v2 handles DE accent
}

# Language codes for ElevenLabs (only needed when voice isn't native)
LANG_CODES = {
    "de":    "de",
}

# Voice settings: (stability, similarity_boost, style)
SETTINGS_NORMAL = {"stability": 0.55, "similarity_boost": 0.8, "style": 0.35}
SETTINGS_REVEAL = {"stability": 0.65, "similarity_boost": 0.85, "style": 0.4}
SETTINGS_CTA    = {"stability": 0.6,  "similarity_boost": 0.85, "style": 0.4}

# Per-scene voice settings
SCENE_SETTINGS = {
    1: SETTINGS_NORMAL,
    2: SETTINGS_NORMAL,
    3: SETTINGS_REVEAL,
    4: SETTINGS_NORMAL,
    5: SETTINGS_NORMAL,
    6: SETTINGS_NORMAL,
    7: SETTINGS_CTA,
}

# File suffix per language
SUFFIXES = {
    "en":    "",
    "pt":    "-pt",
    "pt-pt": "-pt-pt",
    "es":    "-es",
    "fr":    "-fr",
    "it":    "-it",
    "pl":    "-pl",
    "de":    "-de",
}

# ─── Voiceover Scripts ───────────────────────────────────────────────────
SCRIPTS = {
    "en": {
        1: "Forty-seven WhatsApp groups. Two hundred unread messages. Sound familiar?",
        2: "No-shows without warning. Double bookings every week. Hours wasted coordinating shifts. Your workers deserve better tools. And so do you.",
        3: "Introducing Traggo. One platform. Full control.",
        4: "See every worker. Every shift. Every zone. In real time. Your admin dashboard gives you complete visibility across your entire workforce. No more guessing. No more spreadsheets.",
        5: "Workers confirm availability in seconds. One app. Simpler than WhatsApp.",
        6: "Three steps. Register your team. Workers use the app. You see everything. Already in use by logistics companies across Portugal.",
        7: "Ready to leave WhatsApp behind? Start with just two euros per worker per month. Visit traggo.io and take control today.",
    },
    "pt": {
        1: "Quarenta e sete grupos de WhatsApp. Duzentas mensagens por ler. Soa familiar?",
        2: "Faltas sem aviso. Reservas duplicadas. Horas perdidas a coordenar turnos. Mereces melhor.",
        3: "Apresentamos o Traggo.",
        4: "Cada trabalhador. Cada turno. Cada zona. Em tempo real. Visibilidade total. Sem adivinhar.",
        5: "Trabalhadores confirmam disponibilidade em segundos. Uma app. Mais simples que o WhatsApp.",
        6: "Três passos. Regista a tua equipa. Os trabalhadores usam a app. Tu vês tudo.",
        7: "Pronto para deixar o WhatsApp? A partir de dois euros por trabalhador por mês. Visita traggo.io e assume o controlo hoje.",
    },
    "pt-pt": {
        1: "Quarenta e sete grupos de WhatsApp. Duzentas mensagens por ler. Soa familiar?",
        2: "Faltas sem aviso. Reservas duplicadas. Horas perdidas a coordenar turnos. Mereces melhor.",
        3: "Apresentamos o Traggo.",
        4: "Cada trabalhador. Cada turno. Cada zona. Em tempo real. Visibilidade total. Sem adivinhar.",
        5: "Trabalhadores confirmam disponibilidade em segundos. Uma app. Mais simples que o WhatsApp.",
        6: "Três passos. Regista a tua equipa. Os trabalhadores usam a app. Tu vês tudo.",
        7: "Pronto para deixar o WhatsApp? A partir de dois euros por trabalhador por mês. Visita traggo.io e assume o controlo hoje.",
    },
    "es": {
        1: "Cuarenta y siete grupos de WhatsApp. Doscientos mensajes sin leer. ¿Te suena familiar?",
        2: "Ausencias sin aviso. Reservas dobles. Horas perdidas coordinando turnos. Mereces algo mejor.",
        3: "Presentamos Traggo.",
        4: "Cada trabajador. Cada turno. Cada zona. En tiempo real. Visibilidad total. Sin adivinar.",
        5: "Los trabajadores confirman disponibilidad en segundos. Una app. Más sencilla que WhatsApp.",
        6: "Tres pasos. Registra tu equipo. Los trabajadores usan la app. Tú ves todo.",
        7: "¿Listo para dejar WhatsApp? Desde solo dos euros por trabajador al mes. Visita traggo.io y toma el control hoy.",
    },
    "fr": {
        1: "Quarante-sept groupes WhatsApp. Deux cents messages non lus. Ça vous dit quelque chose?",
        2: "Absences sans prévenir. Doubles réservations. Des heures perdues à coordonner. Vous méritez mieux.",
        3: "Voici Traggo.",
        4: "Chaque travailleur. Chaque équipe. Chaque zone. En temps réel. Visibilité totale. Plus de devinettes.",
        5: "Les travailleurs confirment leur disponibilité en secondes. Une seule app. Plus simple que WhatsApp.",
        6: "Trois étapes. Inscrivez votre équipe. Les travailleurs utilisent l'app. Vous voyez tout.",
        7: "Prêt à quitter WhatsApp? À partir de deux euros par travailleur par mois. Rendez-vous sur traggo.io.",
    },
    "it": {
        1: "Quarantasette gruppi WhatsApp. Duecento messaggi non letti. Ti suona familiare?",
        2: "Assenze senza preavviso. Doppie prenotazioni. Ore perse a coordinare turni. Meriti di meglio.",
        3: "Ti presentiamo Traggo.",
        4: "Ogni lavoratore. Ogni turno. Ogni zona. In tempo reale. Visibilità totale. Niente più ipotesi.",
        5: "I lavoratori confermano la disponibilità in pochi secondi. Un'app. Più semplice di WhatsApp.",
        6: "Tre passi. Registra il tuo team. I lavoratori usano l'app. Tu vedi tutto.",
        7: "Pronto a lasciare WhatsApp? A partire da due euro per lavoratore al mese. Visita traggo.io e prendi il controllo oggi.",
    },
    "pl": {
        1: "Czterdzieści siedem grup na WhatsAppie. Dwieście nieprzeczytanych wiadomości. Brzmi znajomo?",
        2: "Nieobecności bez ostrzeżenia. Podwójne rezerwacje. Godziny stracone na koordynację zmian. Zasługujesz na coś lepszego.",
        3: "Przedstawiamy Traggo.",
        4: "Każdy pracownik. Każda zmiana. Każda strefa. W czasie rzeczywistym. Pełna widoczność. Koniec z domysłami.",
        5: "Pracownicy potwierdzają dostępność w kilka sekund. Jedna aplikacja. Prościej niż WhatsApp.",
        6: "Trzy kroki. Zarejestruj zespół. Pracownicy używają aplikacji. Ty widzisz wszystko.",
        7: "Gotowy porzucić WhatsAppa? Już od dwóch euro za pracownika miesięcznie. Odwiedź traggo.io i przejmij kontrolę.",
    },
    "de": {
        1: "Siebenundvierzig WhatsApp-Gruppen. Zweihundert ungelesene Nachrichten. Kommt dir das bekannt vor?",
        2: "Ausfälle ohne Vorwarnung. Doppelbuchungen. Stundenlange Schichtkoordination. Du verdienst bessere Werkzeuge.",
        3: "Das ist Traggo.",
        4: "Jeder Mitarbeiter. Jede Schicht. Jede Zone. In Echtzeit. Volle Übersicht. Kein Rätselraten mehr.",
        5: "Mitarbeiter bestätigen Verfügbarkeit in Sekunden. Eine App. Einfacher als WhatsApp.",
        6: "Drei Schritte. Registriere dein Team. Mitarbeiter nutzen die App. Du siehst alles.",
        7: "Bereit, WhatsApp hinter dir zu lassen? Ab nur zwei Euro pro Mitarbeiter pro Monat. Starte jetzt auf traggo.io.",
    },
}


def generate_one(lang: str, scene: int) -> str:
    """Generate a single voiceover MP3. Returns the output path."""
    voice_id = VOICES[lang]
    text = SCRIPTS[lang][scene]
    settings = SCENE_SETTINGS[scene]
    suffix = SUFFIXES[lang]
    filename = f"vo-scene{scene}{suffix}.mp3"
    out_path = os.path.join(PUB, filename)

    body = {
        "text": text,
        "model_id": MODEL,
        "voice_settings": settings,
    }
    if lang in LANG_CODES:
        body["language_code"] = LANG_CODES[lang]

    cmd = [
        "curl", "-s",
        f"{API_URL}/{voice_id}",
        "-H", f"xi-api-key: {API_KEY}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(body),
        "--output", out_path,
        "-w", "%{http_code}",
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        http_code = result.stdout.strip()
        if http_code == "200" and os.path.exists(out_path):
            size_kb = os.path.getsize(out_path) / 1024
            return f"  ✓ {filename} ({size_kb:.0f} KB)"
        else:
            return f"  ✗ {filename} — HTTP {http_code}"
    except Exception as e:
        return f"  ✗ {filename} — {e}"


def main():
    parser = argparse.ArgumentParser(description="Generate Traggo voiceovers")
    parser.add_argument("--lang", help="Only generate for this language (en, pt, pt-pt, es, fr, it, pl, de)")
    parser.add_argument("--scene", type=int, help="Only generate this scene number (1-7)")
    args = parser.parse_args()

    langs = [args.lang] if args.lang else list(SCRIPTS.keys())
    scenes = [args.scene] if args.scene else list(range(1, 8))

    total = len(langs) * len(scenes)
    print(f"\n🎙  Traggo Voiceover Generator")
    print(f"   Model: {MODEL}")
    print(f"   Output: {os.path.abspath(PUB)}")
    print(f"   Languages: {', '.join(langs)}")
    print(f"   Scenes: {', '.join(str(s) for s in scenes)}")
    print(f"   Total files: {total}\n")

    done = 0
    for lang in langs:
        print(f"=== {lang.upper()} (voice: {VOICES[lang][:8]}…) ===")
        for scene in scenes:
            result = generate_one(lang, scene)
            print(result)
            done += 1
            # Small delay to avoid rate limits
            if done < total:
                time.sleep(0.5)
        print()

    print(f"Done! {done}/{total} files generated.\n")


if __name__ == "__main__":
    main()
