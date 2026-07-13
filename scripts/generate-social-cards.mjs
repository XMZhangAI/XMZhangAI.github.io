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

await save('og-notes', `
  ${base('#0a1b26')}
  <path d="M0 525h1200M760 0v630" stroke="#f4f1e9" stroke-opacity=".15"/>
  ${mark()}
  <text x="56" y="164" fill="#50d7c8" font-family="${sans}" font-size="15" font-weight="700" letter-spacing="2.4">FIELD NOTES / RESEARCH AFTER THE PAPER</text>
  <text x="56" y="260" fill="#f4f1e9" font-family="${serif}" font-size="69">Evidence first.</text>
  <text x="56" y="338" fill="#50d7c8" font-family="${serif}" font-size="69">Frontier next.</text>
  <text x="56" y="410" fill="#aebbc1" font-family="${sans}" font-size="18">Technical systems, cognitive consequences, and open questions.</text>
  <g transform="translate(835 120)" fill="none" stroke="#50d7c8"><circle cx="130" cy="130" r="38" fill="#50d7c8"/><circle cx="130" cy="130" r="83" stroke-opacity=".8"/><circle cx="130" cy="130" r="128" stroke-opacity=".45"/><path d="M130 0v260M0 130h260" stroke-opacity=".28"/></g>
  <text x="56" y="577" fill="#aebbc1" font-family="${sans}" font-size="16">MetaMind dossier · NeurIPS 2025 Spotlight · English</text>`);

await save('og-metamind', `
  ${base('#165dff')}
  <path d="M0 522h1200M722 0v630" stroke="#fff" stroke-opacity=".22"/>
  ${mark('#ffffff', '#50d7c8')}
  <text x="56" y="161" fill="#cfe0ff" font-family="${sans}" font-size="15" font-weight="700" letter-spacing="2.3">METAMIND DOSSIER · NEURIPS 2025 SPOTLIGHT</text>
  <text x="56" y="275" fill="#fff" font-family="${serif}" font-size="91">Model minds.</text>
  <text x="56" y="365" fill="#50d7c8" font-family="${serif}" font-size="91">Then worlds.</text>
  <text x="56" y="435" fill="#d7e5ff" font-family="${sans}" font-size="18">Technical contribution + cognitive frontier</text>
  <g transform="translate(778 120)" font-family="${sans}">
    <path d="M10 135H312" stroke="#fff" stroke-opacity=".4"/>
    <circle cx="35" cy="135" r="28" fill="#50d7c8"/><circle cx="161" cy="135" r="28" fill="#fff" fill-opacity=".2" stroke="#fff"/><circle cx="287" cy="135" r="28" fill="#fff" fill-opacity=".2" stroke="#fff"/>
    <text x="35" y="139" text-anchor="middle" fill="#07141e" font-size="12" font-weight="800">INFER</text><text x="161" y="139" text-anchor="middle" fill="#fff" font-size="10" font-weight="800">REFINE</text><text x="287" y="139" text-anchor="middle" fill="#fff" font-size="9" font-weight="800">VALIDATE</text>
    <text x="10" y="230" fill="#d7e5ff" font-size="12" letter-spacing="1.2">16+ MODEL BACKBONES</text><text x="10" y="270" fill="#fff" font-family="${serif}" font-size="38">+35.7%</text><text x="190" y="270" fill="#d7e5ff" font-size="12">REAL SOCIAL SCENARIOS</text>
  </g>
  <text x="56" y="575" fill="#d7e5ff" font-family="${sans}" font-size="15">Xuanming Zhang · Yuxuan Chen · Samuel Yeh · Sharon Li</text>`);

await save('og-metamind-technical', `
  ${base('#071f27')}
  <path d="M0 525h1200M755 0v630" stroke="#f4f1e9" stroke-opacity=".16"/>
  ${mark()}
  <text x="56" y="158" fill="#50d7c8" font-family="${sans}" font-size="15" font-weight="700" letter-spacing="2.1">METAMIND / TECHNICAL CONTRIBUTION</text>
  <text x="56" y="242" fill="#f4f1e9" font-family="${serif}" font-size="61">Social intelligence</text>
  <text x="56" y="311" fill="#f4f1e9" font-family="${serif}" font-size="61">begins <tspan fill="#50d7c8">before</tspan></text>
  <text x="56" y="380" fill="#50d7c8" font-family="${serif}" font-size="61">the answer.</text>
  <text x="56" y="447" fill="#aebbc1" font-family="${sans}" font-size="17">Latent mental states · Norm-aware refinement · Reflective validation</text>
  <g transform="translate(825 120)" font-family="${sans}"><text x="0" y="0" fill="#aebbc1" font-size="12" letter-spacing="1.2">STAGED METACOGNITION</text><path d="M15 115H295" stroke="#f4f1e9" stroke-opacity=".32"/><circle cx="35" cy="115" r="31" fill="#50d7c8"/><circle cx="155" cy="115" r="31" fill="#173a44" stroke="#50d7c8"/><circle cx="275" cy="115" r="31" fill="#173a44" stroke="#50d7c8"/><text x="35" y="119" text-anchor="middle" fill="#07141e" font-size="10" font-weight="800">INFER</text><text x="155" y="119" text-anchor="middle" fill="#f4f1e9" font-size="9" font-weight="800">CONSTRAIN</text><text x="275" y="119" text-anchor="middle" fill="#f4f1e9" font-size="9" font-weight="800">VALIDATE</text><text x="0" y="240" fill="#50d7c8" font-family="${serif}" font-size="29">NeurIPS 2025 Spotlight</text><text x="0" y="285" fill="#aebbc1" font-size="13">16+ models · 4 benchmarks · full ablations</text></g>
  <text x="56" y="575" fill="#aebbc1" font-family="${sans}" font-size="15">Evidence-led field note · Xuanming Zhang</text>`);

await save('og-metamind-cognitive', `
  ${base('#11102a')}
  <path d="M0 525h1200M750 0v630" stroke="#f4f1e9" stroke-opacity=".15"/>
  ${mark('#f4f1e9', '#ffbe5c')}
  <text x="56" y="158" fill="#ffbe5c" font-family="${sans}" font-size="15" font-weight="700" letter-spacing="2.1">METAMIND / COGNITIVE FRONTIER</text>
  <text x="56" y="241" fill="#f4f1e9" font-family="${serif}" font-size="60">From cognitive</text>
  <text x="56" y="309" fill="#f4f1e9" font-family="${serif}" font-size="60">scaffolds to</text>
  <text x="56" y="377" fill="#ffbe5c" font-family="${serif}" font-size="60">native capability.</text>
  <text x="56" y="445" fill="#b8b3cc" font-family="${sans}" font-size="17">Structure · Process supervision · Interaction · Experiential worlds</text>
  <g transform="translate(835 100)" fill="none"><circle cx="125" cy="145" r="42" fill="#ffbe5c"/><circle cx="125" cy="145" r="84" stroke="#ffbe5c" stroke-opacity=".7"/><circle cx="125" cy="145" r="126" stroke="#f4f1e9" stroke-opacity=".35"/><circle cx="125" cy="145" r="168" stroke="#f4f1e9" stroke-opacity=".18"/><path d="M125 -23v336M-43 145h336" stroke="#f4f1e9" stroke-opacity=".13"/></g>
  <g transform="translate(785 445)" fill="#b8b3cc" font-family="${sans}" font-size="11" letter-spacing="1"><text x="0" y="0">SCAFFOLD</text><text x="101" y="0">LEARN</text><text x="172" y="0">INTERACT</text><text x="276" y="0">WORLD</text></g>
  <text x="56" y="575" fill="#b8b3cc" font-family="${sans}" font-size="15">Interpretive research agenda · Evidence boundary explicit</text>`);

console.log('Generated 6 social cards at 1200×630.');
