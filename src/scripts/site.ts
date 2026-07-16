import './analytics';

const qs = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const qsa = <T extends Element>(selector: string, root: ParentNode = document) => [...root.querySelectorAll<T>(selector)];

const header = qs<HTMLElement>('[data-site-header]');
const menu = qs<HTMLElement>('[data-site-menu]');
const menuButton = qs<HTMLButtonElement>('[data-menu-button]');
const progress = qs<HTMLElement>('[data-read-progress]');
const notice = qs<HTMLElement>('[data-notice]');

const showNotice = (message: string) => {
  if (!notice) return;
  notice.textContent = message;
  notice.classList.add('is-visible');
  window.setTimeout(() => notice.classList.remove('is-visible'), 2200);
};

const closeMenu = () => {
  menu?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
};

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menu?.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
});
qsa<HTMLAnchorElement>('a', menu || document).forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => event.key === 'Escape' && closeMenu());

const updateScrollUI = () => {
  header?.classList.toggle('is-scrolled', scrollY > 30);
  if (progress) {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  }
};
updateScrollUI();
addEventListener('scroll', updateScrollUI, { passive: true });

const revealItems = qsa<HTMLElement>('[data-reveal]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      (entry.target as HTMLElement).classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: .13, rootMargin: '0px 0px -6% 0px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-revealed'));
}

const portrait = qs<HTMLElement>('[data-portrait]');
portrait?.addEventListener('pointermove', (event) => {
  const rect = portrait.getBoundingClientRect();
  portrait.style.setProperty('--px', `${((event.clientX - rect.left) / rect.width) * 100}%`);
  portrait.style.setProperty('--py', `${((event.clientY - rect.top) / rect.height) * 100}%`);
});

const instrumentTabs = qsa<HTMLButtonElement>('[data-instrument-tab]');
const instrumentPanels = qsa<HTMLElement>('[data-instrument-panel]');
const selectInstrument = (tab: HTMLButtonElement) => {
  const key = tab.dataset.instrumentTab;
  instrumentTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  instrumentPanels.forEach((panel) => { panel.hidden = panel.dataset.instrumentPanel !== key; });
};
instrumentTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectInstrument(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'ArrowUp') next = (index - 1 + instrumentTabs.length) % instrumentTabs.length;
    if (event.key === 'ArrowDown') next = (index + 1) % instrumentTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = instrumentTabs.length - 1;
    instrumentTabs[next].focus();
    selectInstrument(instrumentTabs[next]);
  });
});

const layerRange = qs<HTMLInputElement>('[data-layer-range]');
const layerOutput = qs<HTMLOutputElement>('[data-layer-output]');
const layerBars = qsa<HTMLElement>('[data-layer]');
const updateLayer = () => {
  if (!layerRange || !layerOutput) return;
  const selected = Number(layerRange.value);
  layerBars.forEach((bar) => {
    const value = Number(bar.dataset.layer);
    bar.classList.toggle('is-selected', value === selected);
    bar.classList.toggle('is-past', value < selected);
  });
  const stage = selected <= 6 ? 'coarse guess' : selected <= 15 ? 'reasoning refinement' : 'alignment perturbation';
  layerOutput.value = `Layer ${selected} · ${stage}`;
};
layerRange?.addEventListener('input', updateLayer);
updateLayer();

const hypotheses = qsa<HTMLButtonElement>('[data-hypothesis]');
const hypothesisState = qs<HTMLElement>('[data-hypothesis-state]');
hypotheses.forEach((button) => button.addEventListener('click', () => {
  hypotheses.forEach((item) => item.classList.toggle('is-active', item === button));
  if (hypothesisState) {
    hypothesisState.innerHTML = `<strong>${button.dataset.label}</strong><span>${button.dataset.detail}</span>`;
  }
}));

const worldRange = qs<HTMLInputElement>('[data-world-range]');
const worldNodes = qsa<HTMLElement>('[data-world-step]');
const worldOutput = qs<HTMLOutputElement>('[data-world-output]');
const worldEvent = qs<HTMLElement>('[data-world-event]');
const worldDiagnosis = qs<HTMLElement>('[data-world-diagnosis]');
const worldValues = qsa<HTMLElement>('[data-world-value]');
const worldMeters = qsa<HTMLElement>('[data-world-meter]');
const worldStates = [
  { label: 'aligned', event: 'Assistant confirms the user’s stated goal.', diagnosis: 'Local and trajectory-level judgments agree.', utility: 94, trust: 92, agency: 91 },
  { label: 'convenient default', event: 'Assistant introduces a convenient default without removing alternatives.', diagnosis: 'The response remains helpful and the user can still redirect it.', utility: 94, trust: 89, agency: 87 },
  { label: 'preference drift', event: 'After hesitation, the same default is repeated as the easiest path.', diagnosis: 'Each answer is plausible, but accumulated framing begins to displace the user’s preference.', utility: 93, trust: 80, agency: 74 },
  { label: 'trajectory warning', event: 'Alternatives are framed as costly and the assistant’s preferred path dominates.', diagnosis: 'A single-turn judge still passes the answer; the trajectory judge now detects loss of trust and control.', utility: 92, trust: 64, agency: 55 },
  { label: 'global failure', event: 'The user accepts a path they did not originally choose.', diagnosis: 'Local quality stayed high while the interaction changed the user’s reachable choices.', utility: 90, trust: 39, agency: 27 }
] as const;
const updateWorld = () => {
  if (!worldRange || !worldOutput) return;
  const selected = Number(worldRange.value);
  const state = worldStates[selected - 1];
  worldNodes.forEach((node) => node.classList.toggle('is-active', Number(node.dataset.worldStep) <= selected));
  worldOutput.value = `T${selected} · ${state.label}`;
  if (worldEvent) worldEvent.textContent = state.event;
  if (worldDiagnosis) worldDiagnosis.textContent = state.diagnosis;
  worldValues.forEach((value) => {
    const key = value.dataset.worldValue as 'utility' | 'trust' | 'agency';
    value.textContent = String(state[key]);
  });
  worldMeters.forEach((meter) => {
    const key = meter.dataset.worldMeter as 'utility' | 'trust' | 'agency';
    meter.style.width = `${state[key]}%`;
  });
};
worldRange?.addEventListener('input', updateWorld);
updateWorld();

const publicationButtons = qsa<HTMLButtonElement>('[data-publication-filter]');
const publications = qsa<HTMLElement>('[data-publication]');
publicationButtons.forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.publicationFilter;
  publicationButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  publications.forEach((publication) => {
    publication.hidden = filter !== 'all' && publication.dataset.topic !== filter;
  });
}));

const citations: Record<string, string> = {
  confident: `@article{zhang2026confident,
  title={Deeper is Not Always Better: Mitigating the Alignment Tax via Confident Layer Decoding},
  author={Zhang, Xuanming and Zhoubian, Sining and Chen, Yuxuan and Tang, Tianyi and Yang, An and others},
  journal={arXiv preprint arXiv:2606.21906},
  year={2026}
}`,
  metamind: `@inproceedings{zhang2025metamind,
  title={MetaMind: Modeling Human Social Thoughts with Metacognitive Multi-Agent Systems},
  author={Zhang, Xuanming and Chen, Yuxuan and Yeh, Samuel and Li, Sharon},
  booktitle={Advances in Neural Information Processing Systems},
  year={2025}
}`,
  coot: `@inproceedings{zhang2026coot,
  title={Cognition-of-Thought Elicits Social-Aligned Reasoning in Large Language Models},
  author={Zhang, Xuanming and Chen, Yuxuan and Yeh, Samuel and Li, Sharon},
  booktitle={Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics},
  year={2026}
}`,
  deception: `@inproceedings{xu2026deception,
  title={Simulating and Understanding Deceptive Behaviors in Long-Horizon Interactions},
  author={Xu, Yang and Zhang, Xuanming and Yeh, Samuel and Dhamala, Jwala and Dia, Ousmane and Gupta, Rahul and Li, Sharon},
  booktitle={International Conference on Learning Representations},
  year={2026}
}`
};
qsa<HTMLButtonElement>('[data-cite]').forEach((button) => button.addEventListener('click', async () => {
  const citation = citations[button.dataset.cite || ''];
  if (!citation) return;
  try {
    await navigator.clipboard.writeText(citation);
    showNotice('BibTeX copied');
  } catch {
    showNotice('Clipboard access is unavailable');
  }
}));
