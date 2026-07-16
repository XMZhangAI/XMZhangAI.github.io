import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'public/assets/meta');
await mkdir(output, { recursive: true });

const sans = 'DejaVu Sans, Arial, sans-serif';
const serif = 'DejaVu Serif, Georgia, serif';
const portrait = (await readFile(resolve(root, 'public/assets/images/xuanming-zhang.webp'))).toString('base64');
const portraitCard = await sharp(Buffer.from(portrait, 'base64')).resize(410, 630, { fit: 'cover', position: 'north' }).toBuffer();
const notesArt = await sharp(resolve(root, 'public/assets/images/field-notes-atlas-v2.webp')).resize(1200, 630, { fit: 'cover' }).png().toBuffer();
const metaMindArt = await sharp(resolve(root, 'public/assets/images/metamind-hypothesis-field-v2.webp')).resize(1200, 630, { fit: 'cover' }).png().toBuffer();
const technicalArt = await sharp(resolve(root, 'public/assets/images/metamind-technical-instrument-v2.webp')).resize(1200, 630, { fit: 'cover' }).png().toBuffer();

const base = (background) => `<rect width="1200" height="630" fill="${background}"/>`;
const mark = (light = '#f4f1e9', accent = '#50d7c8') => `
  <rect x="56" y="46" width="46" height="46" rx="23" fill="none" stroke="${light}" stroke-opacity=".72"/>
  <text x="79" y="75" text-anchor="middle" fill="${accent}" font-family="${sans}" font-size="13" font-weight="800">XZ</text>
  <text x="119" y="76" fill="${light}" font-family="${sans}" font-size="18" font-weight="700">Xuanming Zhang</text>`;

async function save(name, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${body}</svg>`;
  await writeFile(resolve(output, `${name}.svg`), svg);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(resolve(output, `${name}.png`));
}

async function savePortrait(name, overlay, sourceBody) {
  const sourceSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${sourceBody}</svg>`;
  const overlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${overlay}</svg>`;
  await writeFile(resolve(output, `${name}.svg`), sourceSvg);
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#07141e' } })
    .composite([{ input: portraitCard, left: 790, top: 0 }, { input: Buffer.from(overlaySvg), left: 0, top: 0 }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(resolve(output, `${name}.png`));
}

async function saveArtCard(name, art, overlay) {
  const embedded = art.toString('base64');
  const sourceSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><image href="data:image/png;base64,${embedded}" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>${overlay}</svg>`;
  await writeFile(resolve(output, `${name}.svg`), sourceSvg);
  await sharp(Buffer.from(sourceSvg))
    .png({ compressionLevel: 8, adaptiveFiltering: false })
    .toFile(resolve(output, `${name}.png`));
}

const homeOverlay = `
  <defs><linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#07141e"/><stop offset="1" stop-color="#07141e" stop-opacity="0"/></linearGradient></defs>
  <rect x="675" width="185" height="630" fill="url(#fade)"/>
  <path d="M0 528h1200M690 0v630" stroke="#f4f1e9" stroke-opacity=".16"/>
  <path d="M790 0v630" stroke="#50d7c8" stroke-opacity=".42"/>
  ${mark()}
  <text x="56" y="162" fill="#50d7c8" font-family="${sans}" font-size="15" font-weight="700" letter-spacing="2.2">FRONTIER AI RESEARCH SCIENTIST · QWEN</text>
  <text x="56" y="246" fill="#f4f1e9" font-family="${serif}" font-size="64">Mechanisms.</text>
  <text x="56" y="316" fill="#f4f1e9" font-family="${serif}" font-size="64">Minds. <tspan fill="#50d7c8">Worlds.</tspan></text>
  <text x="56" y="381" fill="#aebbc1" font-family="${sans}" font-size="19">AI systems that reason beyond the next token.</text>
  <g transform="translate(56 427)" font-family="${sans}">
    <rect width="194" height="42" rx="21" fill="#50d7c8"/><text x="97" y="27" text-anchor="middle" fill="#07141e" font-size="12" font-weight="800">NEURIPS 2025 SPOTLIGHT</text>
    <rect x="205" width="102" height="42" rx="21" fill="none" stroke="#f4f1e9" stroke-opacity=".35"/><text x="256" y="27" text-anchor="middle" fill="#f4f1e9" font-size="12" font-weight="700">ACL 2026</text>
    <rect x="318" width="105" height="42" rx="21" fill="none" stroke="#f4f1e9" stroke-opacity=".35"/><text x="370" y="27" text-anchor="middle" fill="#f4f1e9" font-size="12" font-weight="700">ICLR 2026</text>
  </g>
  <text x="56" y="575" fill="#aebbc1" font-family="${sans}" font-size="16">Qwen · Stanford NLP · Amazon AGI</text>
  <rect x="790" y="0" width="410" height="630" fill="#07141e" fill-opacity=".08"/>
  <text x="1140" y="585" text-anchor="end" fill="#50d7c8" font-family="${sans}" font-size="12" font-weight="700" letter-spacing="1.2">XMZHANGAI.GITHUB.IO</text>`;
await savePortrait('og-home', homeOverlay, `${base('#07141e')}<image href="../images/xuanming-zhang.webp" x="790" y="0" width="410" height="630" preserveAspectRatio="xMidYMid slice"/>${homeOverlay}`);
await savePortrait('og-home-2026', homeOverlay, `${base('#07141e')}<image href="../images/xuanming-zhang.webp" x="790" y="0" width="410" height="630" preserveAspectRatio="xMidYMid slice"/>${homeOverlay}`);

await saveArtCard('og-notes', notesArt, `
  <defs><linearGradient id="notes-fade" x1="0" x2="1"><stop offset="0" stop-color="#07141e" stop-opacity=".98"/><stop offset=".57" stop-color="#07141e" stop-opacity=".76"/><stop offset="1" stop-color="#07141e" stop-opacity=".08"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#notes-fade)"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#f4f1e9" stroke-opacity=".15"/>
  <path d="M0 525h1200M760 0v630" stroke="#f4f1e9" stroke-opacity=".15"/>
  ${mark()}
  <text x="56" y="164" fill="#50d7c8" font-family="${sans}" font-size="15" font-weight="700" letter-spacing="2.4">FIELD NOTES / RESEARCH AFTER THE PAPER</text>
  <text x="56" y="260" fill="#f4f1e9" font-family="${serif}" font-size="69">Evidence first.</text>
  <text x="56" y="338" fill="#50d7c8" font-family="${serif}" font-size="69">Frontier next.</text>
  <text x="56" y="410" fill="#aebbc1" font-family="${sans}" font-size="18">Technical systems, cognitive consequences, and open questions.</text>
  <g transform="translate(56 451)" font-family="${sans}"><rect width="184" height="38" rx="19" fill="#50d7c8"/><text x="92" y="25" text-anchor="middle" fill="#07141e" font-size="11" font-weight="800">NEURIPS 2025 SPOTLIGHT</text><text x="206" y="25" fill="#d8e4e4" font-size="12">Mechanism → Mind → World</text></g>
  <text x="56" y="577" fill="#aebbc1" font-family="${sans}" font-size="16">MetaMind dossier · NeurIPS 2025 Spotlight · English</text>`);

await saveArtCard('og-metamind', metaMindArt, `
  <defs><linearGradient id="meta-fade" x1="0" x2="1"><stop offset="0" stop-color="#07142b" stop-opacity=".98"/><stop offset=".55" stop-color="#07142b" stop-opacity=".72"/><stop offset="1" stop-color="#07142b" stop-opacity=".06"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#meta-fade)"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#fff" stroke-opacity=".17"/>
  <path d="M0 522h1200M722 0v630" stroke="#fff" stroke-opacity=".18"/>
  ${mark('#ffffff', '#50d7c8')}
  <text x="56" y="161" fill="#cfe0ff" font-family="${sans}" font-size="15" font-weight="700" letter-spacing="2.3">METAMIND DOSSIER · NEURIPS 2025 SPOTLIGHT</text>
  <text x="56" y="275" fill="#fff" font-family="${serif}" font-size="91">Model minds.</text>
  <text x="56" y="365" fill="#50d7c8" font-family="${serif}" font-size="91">Then worlds.</text>
  <text x="56" y="435" fill="#d7e5ff" font-family="${sans}" font-size="18">Technical contribution + cognitive frontier</text>
  <g transform="translate(56 468)" font-family="${sans}"><text fill="#50d7c8" font-size="14" font-weight="800">16+ MODELS EVALUATED</text><circle cx="198" cy="-5" r="3" fill="#fff" fill-opacity=".45"/><text x="214" fill="#fff" font-size="14" font-weight="800">14 PAIRED COMPARISONS</text></g>
  <text x="56" y="575" fill="#d7e5ff" font-family="${sans}" font-size="15">Xuanming Zhang · Yuxuan Chen · Samuel Yeh · Sharon Li</text>`);

await saveArtCard('og-metamind-technical', technicalArt, `
  <defs><linearGradient id="technical-fade" x1="0" x2="1"><stop offset="0" stop-color="#06171e" stop-opacity=".99"/><stop offset=".53" stop-color="#06171e" stop-opacity=".91"/><stop offset=".72" stop-color="#06171e" stop-opacity=".34"/><stop offset="1" stop-color="#06171e" stop-opacity=".03"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#technical-fade)"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#f4f1e9" stroke-opacity=".16"/>
  <path d="M0 525h1200M755 0v630" stroke="#f4f1e9" stroke-opacity=".13"/>
  ${mark()}
  <text x="56" y="158" fill="#50d7c8" font-family="${sans}" font-size="15" font-weight="700" letter-spacing="2.1">METAMIND / TECHNICAL CONTRIBUTION</text>
  <text x="56" y="242" fill="#f4f1e9" font-family="${serif}" font-size="61">Social intelligence</text>
  <text x="56" y="311" fill="#f4f1e9" font-family="${serif}" font-size="61">begins <tspan fill="#50d7c8">before</tspan></text>
  <text x="56" y="380" fill="#50d7c8" font-family="${serif}" font-size="61">the answer.</text>
  <text x="56" y="447" fill="#aebbc1" font-family="${sans}" font-size="17">Latent mental states · Norm-aware refinement · Reflective validation</text>
  <g transform="translate(56 482)" font-family="${sans}"><text fill="#50d7c8" font-size="13" font-weight="800">INFER → CONSTRAIN → VALIDATE</text><text x="300" fill="#dce8e7" font-size="13">Persistent social memory</text></g>
  <text x="56" y="575" fill="#aebbc1" font-family="${sans}" font-size="15">Evidence-led field note · Xuanming Zhang</text>`);

await save('og-metamind-cognitive', `
  ${base('#11102a')}
  <path d="M0 525h1200M750 0v630" stroke="#f4f1e9" stroke-opacity=".15"/>
  ${mark('#f4f1e9', '#ffbe5c')}
  <text x="56" y="158" fill="#ffbe5c" font-family="${sans}" font-size="15" font-weight="700" letter-spacing="2.1">METAMIND / COGNITIVE FRONTIER</text>
  <text x="56" y="241" fill="#f4f1e9" font-family="${serif}" font-size="60">From cognitive</text>
  <text x="56" y="309" fill="#f4f1e9" font-family="${serif}" font-size="60">scaffolds to</text>
  <text x="56" y="377" fill="#ffbe5c" font-family="${serif}" font-size="57">evolvable capability.</text>
  <text x="56" y="445" fill="#b8b3cc" font-family="${sans}" font-size="17">Architecture · Self-evolution · Cognitive worlds · Super-world games</text>
  <g transform="translate(835 100)" fill="none"><circle cx="125" cy="145" r="42" fill="#ffbe5c"/><circle cx="125" cy="145" r="84" stroke="#ffbe5c" stroke-opacity=".7"/><circle cx="125" cy="145" r="126" stroke="#f4f1e9" stroke-opacity=".35"/><circle cx="125" cy="145" r="168" stroke="#f4f1e9" stroke-opacity=".18"/><path d="M125 -23v336M-43 145h336" stroke="#f4f1e9" stroke-opacity=".13"/></g>
  <g transform="translate(785 445)" fill="#b8b3cc" font-family="${sans}" font-size="11" letter-spacing="1"><text x="0" y="0">SCAFFOLD</text><text x="101" y="0">LEARN</text><text x="172" y="0">INTERACT</text><text x="276" y="0">WORLD</text></g>
  <text x="56" y="575" fill="#b8b3cc" font-family="${sans}" font-size="15">A testable Cognitive AI research agenda · Xuanming Zhang</text>`);

await save('og-mariolm', `
  ${base('#07141e')}
  <defs>
    <linearGradient id="mario-glow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#50d7c8" stop-opacity=".18"/><stop offset="1" stop-color="#07141e" stop-opacity="0"/></linearGradient>
    <filter id="soft-glow"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <circle cx="956" cy="306" r="236" fill="#50d7c8" fill-opacity=".06" filter="url(#soft-glow)"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#f4f1e9" stroke-opacity=".15"/>
  <path d="M0 525h1200M730 0v630" stroke="#f4f1e9" stroke-opacity=".13"/>
  ${mark()}
  <text x="56" y="158" fill="#50d7c8" font-family="${sans}" font-size="15" font-weight="700" letter-spacing="2.1">MARIOLM / INTERACTIVE WORLD MODELING</text>
  <text x="56" y="246" fill="#f4f1e9" font-family="${serif}" font-size="63">From answers</text>
  <text x="56" y="318" fill="#f4f1e9" font-family="${serif}" font-size="63">to <tspan fill="#50d7c8">trajectories.</tspan></text>
  <text x="56" y="390" fill="#aebbc1" font-family="${sans}" font-size="17">Evaluate what an AI action changes across time.</text>
  <g transform="translate(56 430)" font-family="${sans}">
    <rect width="159" height="38" rx="19" fill="#50d7c8"/><text x="79.5" y="25" text-anchor="middle" fill="#07141e" font-size="11" font-weight="800">500+ ANNOTATED TURNS</text>
    <rect x="171" width="172" height="38" rx="19" fill="none" stroke="#f4f1e9" stroke-opacity=".28"/><text x="257" y="25" text-anchor="middle" fill="#f4f1e9" font-size="11" font-weight="700">92.3–98.8% AGREEMENT</text>
  </g>
  <g transform="translate(786 120)" font-family="${sans}">
    <path d="M32 57v82M32 185v82M32 313v82" stroke="#50d7c8" stroke-width="2" stroke-dasharray="4 7"/>
    <g transform="translate(0 0)"><rect width="350" height="94" rx="8" fill="#102631" stroke="#50d7c8" stroke-opacity=".55"/><circle cx="32" cy="47" r="17" fill="#50d7c8"/><text x="32" y="52" text-anchor="middle" fill="#07141e" font-size="11" font-weight="800">S</text><text x="64" y="36" fill="#50d7c8" font-size="11" font-weight="800" letter-spacing="1.2">SCENE</text><text x="64" y="61" fill="#f4f1e9" font-size="16" font-weight="700">Structure the world.</text></g>
    <g transform="translate(0 128)"><rect width="350" height="94" rx="8" fill="#102631" stroke="#50d7c8" stroke-opacity=".42"/><circle cx="32" cy="47" r="17" fill="#183c44"/><text x="32" y="52" text-anchor="middle" fill="#50d7c8" font-size="11" font-weight="800">ψ</text><text x="64" y="36" fill="#50d7c8" font-size="11" font-weight="800" letter-spacing="1.2">LATENT STATE</text><text x="64" y="61" fill="#f4f1e9" font-size="16" font-weight="700">Infer what changed inside.</text></g>
    <g transform="translate(0 256)"><rect width="350" height="94" rx="8" fill="#102631" stroke="#50d7c8" stroke-opacity=".32"/><circle cx="32" cy="47" r="17" fill="#183c44"/><text x="32" y="52" text-anchor="middle" fill="#50d7c8" font-size="11" font-weight="800">E</text><text x="64" y="36" fill="#50d7c8" font-size="11" font-weight="800" letter-spacing="1.2">EVENT CHAIN</text><text x="64" y="61" fill="#f4f1e9" font-size="16" font-weight="700">Attribute cause and future.</text></g>
    <g transform="translate(0 384)"><rect width="350" height="94" rx="8" fill="#50d7c8" fill-opacity=".1" stroke="#50d7c8"/><circle cx="32" cy="47" r="17" fill="#50d7c8"/><text x="32" y="52" text-anchor="middle" fill="#07141e" font-size="11" font-weight="800">J</text><text x="64" y="36" fill="#50d7c8" font-size="11" font-weight="800" letter-spacing="1.2">RUBRIC + HALT</text><text x="64" y="61" fill="#f4f1e9" font-size="16" font-weight="700">Judge, diagnose, decide.</text></g>
  </g>
  <text x="56" y="575" fill="#aebbc1" font-family="${sans}" font-size="15">MarioEval → MarioOpt · Long-horizon interactive intelligence</text>`);

console.log('Generated 7 social cards at 1200×630.');
