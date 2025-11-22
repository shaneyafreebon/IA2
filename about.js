/* Simple IntersectionObserver to reveal elements with a small stagger */
(function () {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        /* if user prefers reduced motion, just make elements visible */
        document.querySelectorAll('[data-animate]').forEach(el => el.classList.add('in-view'));
        return;
    }

    const items = Array.from(document.querySelectorAll('[data-animate]'));
    if (!items.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            /* stagger based on index among items */
            const index = items.indexOf(el);
            const delay = Math.min(300, index * 80);
            setTimeout(() => el.classList.add('in-view'), delay);
            obs.unobserve(el);
        });
    }, { threshold: 0.12 });

    items.forEach(i => observer.observe(i));
})();
/* About page animations: reveal sections when in view */
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = { threshold: 0.08, rootMargin: '0px 0px -50px 0px' };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    /* Observe title, text blocks and side panel */
    document.querySelectorAll('.section__title, .about__text, .about__side, .founder-image').forEach(el => {
        if (el) observer.observe(el);
    });

    /* Add subtle floating animation to founder image */
    const founder = document.querySelector('.founder-image');
    if (founder) {
        founder.style.transition = 'transform 800ms cubic-bezier(.2,.9,.2,1)';
        founder.addEventListener('mouseenter', () => { founder.style.transform = 'translateY(-6px) scale(1.02)'; });
        founder.addEventListener('mouseleave', () => { founder.style.transform = 'translateY(0) scale(1)'; });
    }
});

/* Enable About animations when user doesn't prefer reduced motion */
document.addEventListener('DOMContentLoaded', function () {
  try {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      document.body.classList.add('allow-animations');
    }
  } catch (e) {
    /* If matchMedia isn't available, enable animations by default */
    document.body.classList.add('allow-animations');
  }
});