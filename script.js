const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cursor = document.querySelector('.cursor-glow');

if (!reduceMotion) {
  window.addEventListener('pointermove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  }, { passive: true });
}

const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach((element) => revealObserver.observe(element));

const engineering = document.querySelector('.engineering');
const progressBar = document.querySelector('.engineering-progress');
const progressNumber = progressBar.querySelector('b');
const cover = document.querySelector('.ex-cover');
const wheel = document.querySelector('.ex-wheel');
const seal = document.querySelector('.ex-seal');
const motor = document.querySelector('.ex-motor');
const tags = [...document.querySelectorAll('.part-tag')];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function updateEngineering() {
  const rect = engineering.getBoundingClientRect();
  const distance = engineering.offsetHeight - window.innerHeight;
  const progress = clamp(-rect.top / distance);
  const spread = progress * 115;

  cover.style.transform = `translateX(${-spread * 1.35}px) rotate(${progress * -8}deg)`;
  wheel.style.transform = `translateX(${-spread * .38}px) rotate(${progress * 220}deg)`;
  seal.style.transform = `translateX(${spread * .24}px)`;
  motor.style.transform = `translateX(${spread * .72}px)`;
  progressBar.style.setProperty('--progress', `${progress * 100}%`);
  progressNumber.textContent = String(Math.min(4, Math.floor(progress * 4) + 1)).padStart(2, '0');
  tags.forEach((tag, index) => {
    tag.style.opacity = progress > index * .2 + .08 ? '1' : '0';
  });
}

if (!reduceMotion) {
  window.addEventListener('scroll', updateEngineering, { passive: true });
  updateEngineering();
} else {
  tags.forEach((tag) => tag.style.opacity = '1');
}

const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const target = Number(entry.target.dataset.count);
    const start = performance.now();
    const duration = 1400;
    function animate(now) {
      const progress = clamp((now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      entry.target.textContent = Number.isInteger(target) ? Math.round(value) : value.toFixed(1);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: .4 });
counters.forEach((counter) => counterObserver.observe(counter));

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.desktop-nav');
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
});

const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const successBox = form.querySelector('.form-success');
  const errorBox = form.querySelector('.form-error');

  successBox.classList.remove('visible');
  errorBox.classList.remove('visible');
  submitButton.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      successBox.classList.add('visible');
      form.reset();
    } else {
      errorBox.classList.add('visible');
    }
  } catch (error) {
    errorBox.classList.add('visible');
  } finally {
    submitButton.disabled = false;
  }
});
