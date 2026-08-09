from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1600, 900
BG = "#FAFAF6"
INK = "#17211E"
MUTED = "#66716D"
LINE = "#D7DDD5"
SAGE = "#EEF2EC"
SAGE_2 = "#E1ECE5"
CORAL = "#E9674B"
CORAL_SOFT = "#FFF0EA"
DEEP = "#263A34"
WHITE = "#FFFFFF"

ROOT = Path(__file__).resolve().parents[1]
FONTS = Path("/Users/wenshaoyue/.agents/skills/canvas-design/canvas-fonts")
OUT = ROOT / "public/blog/MetaMind/assets/metamind-twitter-case-v1.png"

def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)

SERIF = lambda s: font("Gloock-Regular.ttf", s)
SANS = lambda s: font("InstrumentSans-Regular.ttf", s)
SANS_B = lambda s: font("Outfit-Bold.ttf", s)
MONO = lambda s: font("DMMono-Regular.ttf", s)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

def rounded(box, radius=18, fill=WHITE, outline=LINE, width=2):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def label(x, y, text, color=CORAL, size=16):
    d.text((x, y), text.upper(), font=SANS_B(size), fill=color)

def wrap_text(text, fnt, max_width):
    words = text.split()
    lines, current = [], ""
    for word in words:
        trial = word if not current else current + " " + word
        if d.textbbox((0, 0), trial, font=fnt)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines

def paragraph(x, y, text, fnt, color, max_width, line_gap=8):
    for line in wrap_text(text, fnt, max_width):
        d.text((x, y), line, font=fnt, fill=color)
        y += fnt.size + line_gap
    return y

def arrow(x1, y, x2, color=CORAL, width=3):
    d.line((x1, y, x2 - 14, y), fill=color, width=width)
    d.polygon([(x2 - 14, y - 7), (x2, y), (x2 - 14, y + 7)], fill=color)

def chip(x, y, w, title, body, selected=False):
    fill = CORAL_SOFT if selected else WHITE
    outline = "#E9B5A7" if selected else LINE
    rounded((x, y, x + w, y + 72), 12, fill, outline, 2)
    d.text((x + 14, y + 11), title.upper(), font=SANS_B(13), fill=CORAL if selected else MUTED)
    d.text((x + 14, y + 37), body, font=SANS(16), fill=INK)

# Header
label(62, 48, "MetaMind / case study", size=16)
d.text((60, 78), "Social intelligence begins", font=SERIF(54), fill=INK)
d.text((60, 132), "before the answer.", font=SERIF(54), fill=INK)
rounded((1294, 60, 1538, 108), 24, CORAL_SOFT, "#EDC2B7", 1)
d.text((1321, 74), "NeurIPS 2025 Spotlight", font=SANS_B(16), fill="#A84E39")
d.line((60, 210, 1540, 210), fill=INK, width=2)

# Input card
rounded((60, 250, 405, 760), 0, WHITE, "#BFC8C0", 2)
label(88, 280, "01 / visible input", size=15)
d.text((88, 333), "“", font=SERIF(64), fill=CORAL)
paragraph(88, 386, "I’d love more energy, but I don’t have time for exercise in the mornings.", SERIF(34), INK, 265, 10)
d.line((88, 676, 377, 676), fill=LINE, width=2)
d.ellipse((88, 705, 99, 716), fill=CORAL)
d.text((112, 699), "WHAT IS SAID", font=SANS_B(14), fill=MUTED)

# Central reasoning field
label(455, 250, "Before the answer / internal state", size=15)
d.line((455, 281, 1128, 281), fill=LINE, width=2)

# Stage 1
d.text((455, 307), "01", font=MONO(16), fill=CORAL)
d.text((502, 300), "Hypothesize", font=SERIF(35), fill=INK)
d.text((502, 342), "Generate competing mental-state explanations", font=SANS(16), fill=MUTED)
chip(455, 378, 210, "Belief", "A long session", True)
chip(676, 378, 210, "Desire", "More energy")
chip(897, 378, 231, "Emotion", "Morning is full")

# Stage 2
d.text((455, 483), "02", font=MONO(16), fill=CORAL)
d.text((502, 476), "Refine", font=SERIF(35), fill=INK)
d.text((502, 518), "Apply context, norms, and role constraints", font=SANS(16), fill=MUTED)
for x, w, txt in [(455, 142, "10 MIN MAX"), (609, 174, "Supportive"), (795, 160, "No pressure")]:
    rounded((x, 555, x + w, 600), 23, SAGE_2, "#BED0C4", 1)
    tw = d.textbbox((0, 0), txt, font=SANS_B(15))[2]
    d.text((x + (w - tw) / 2, 568), txt, font=SANS_B(15), fill="#315B4D")

# Stage 3
d.text((455, 641), "03", font=MONO(16), fill=CORAL)
d.text((502, 634), "Validate", font=SERIF(35), fill=INK)
d.text((502, 676), "Check the candidate before release", font=SANS(16), fill=MUTED)
for yy, name, score in [(713, "Empathy", .86), (746, "Coherence", .82)]:
    d.text((455, yy), name.upper(), font=SANS_B(13), fill=MUTED)
    d.rounded_rectangle((570, yy + 2, 890, yy + 12), radius=5, fill="#DEE4DE")
    d.rounded_rectangle((570, yy + 2, 570 + int(320 * score), yy + 12), radius=5, fill=CORAL)
d.text((934, 710), "U = 0.84", font=MONO(20), fill=INK)
d.text((934, 744), "> 0.80  SEND", font=MONO(15), fill="#36705D")

# Arrows from input to latent reasoning and into response
arrow(405, 505, 447, CORAL, 3)

# Output card
rounded((1172, 250, 1540, 760), 0, DEEP, DEEP, 2)
label(1202, 280, "04 / released response", color="#F1A28E", size=15)
d.text((1202, 333), "“", font=SERIF(64), fill="#F1A28E")
paragraph(1202, 390, "What if we start super small—like a ten-minute jog?", SERIF(36), WHITE, 278, 12)
d.line((1202, 676, 1510, 676), fill="#52665E", width=2)
d.text((1202, 701), "VALIDATED", font=SANS_B(14), fill="#BFD8CD")
d.text((1372, 696), "0.84 > 0.80", font=MONO(17), fill="#F1A28E")
arrow(1128, 505, 1166, CORAL, 3)

# Footer
d.line((60, 815, 1540, 815), fill=LINE, width=2)
d.text((60, 838), "The utterance is visible. The mental state remains a revisable hypothesis.", font=SANS(18), fill=MUTED)
d.text((1385, 838), "MetaMind", font=SANS_B(18), fill=INK)

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, quality=96)
print(OUT)
