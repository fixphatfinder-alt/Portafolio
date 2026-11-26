const viewer = document.querySelector('.viewer');
const player = viewer.querySelector('.viewer-player');
const viewerTitle = viewer.querySelector('#viewer-title');
const viewerError = viewer.querySelector('.viewer-error');
const viewerFile = viewer.querySelector('.viewer-file');
const teaser = document.querySelector('.teaser');
const teaserToggle = document.querySelector('.teaser-toggle');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let teaserRequested = !motionPreference.matches;
let teaserVisible = false;

const heroStage = document.querySelector('.hero-stage');
heroStage.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse' || motionPreference.matches) return;
  const bounds = heroStage.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  heroStage.style.setProperty('--stage-x', `${x * 16}px`);
  heroStage.style.setProperty('--stage-y', `${y * 12}px`);
});
heroStage.addEventListener('pointerleave', () => {
  heroStage.style.removeProperty('--stage-x');
  heroStage.style.removeProperty('--stage-y');
});

function updateTeaser() {
  if (!teaserRequested || !teaserVisible || viewer.open || document.hidden) {
    teaser.pause();
    return;
  }
  if (!teaser.hasAttribute('src')) teaser.src = teaser.dataset.src;
  teaser.play().catch(() => {});
}

teaserToggle.hidden = false;
function updateToggleLabel() {
  teaserToggle.textContent = teaserRequested ? 'Pausar avance' : 'Reproducir avance';
}
updateToggleLabel();

teaserToggle.addEventListener('click', () => {
  teaserRequested = !teaserRequested;
  updateToggleLabel();
  updateTeaser();
});

motionPreference.addEventListener('change', (event) => {
  teaserRequested = !event.matches;
  updateToggleLabel();
  updateTeaser();
});

new IntersectionObserver(([entry]) => {
  teaserVisible = entry.isIntersecting;
  updateTeaser();
}, { threshold: 0.35 }).observe(teaser);

document.addEventListener('visibilitychange', updateTeaser);

for (const button of document.querySelectorAll('[data-reel]')) {
  button.addEventListener('click', () => {
    const slug = button.dataset.reel;
    const project = document.querySelector(`[data-project="${slug}"]`);
    viewerTitle.textContent = project.querySelector('h3').textContent;
    viewerError.hidden = true;
    viewerFile.href = `assets/reels/${slug}.mp4`;
    player.poster = `assets/reels/${slug}.webp`;
    player.src = viewerFile.href;
    viewer.showModal();
    document.body.classList.add('viewer-open');
    updateTeaser();
    player.play().catch(() => {});
  });
}

player.addEventListener('error', () => {
  if (viewer.open) viewerError.hidden = false;
});

viewer.addEventListener('click', (event) => {
  if (event.target === viewer) viewer.close();
});

viewer.addEventListener('close', () => {
  player.pause();
  player.removeAttribute('src');
  player.load();
  document.body.classList.remove('viewer-open');
  updateTeaser();
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('has-entered');
    observer.unobserve(entry.target);
  }
}, { threshold: 0.14 });

for (const element of document.querySelectorAll('[data-reveal]')) {
  revealObserver.observe(element);
}

document.documentElement.classList.add('reveal-ready');
