(function () {
  const topBar = document.querySelector('.top-bar');
  if (topBar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) topBar.classList.add('scrolled');
      else topBar.classList.remove('scrolled');
    });
  }

  const tabs = document.querySelectorAll('.auth-tab');
  const panels = document.querySelectorAll('.auth-panel');

  function activateTab(tab) {
    tabs.forEach(t => {
      const isActive = t === tab;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach(p => {
      const show = p.id === tab.dataset.tab;
      p.classList.toggle('hidden', !show);
      p.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
  }

  if (tabs.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const idx = Array.from(tabs).indexOf(tab);
          const next = e.key === 'ArrowRight'
            ? (idx + 1) % tabs.length
            : (idx - 1 + tabs.length) % tabs.length;
          tabs[next].focus();
          activateTab(tabs[next]);
        }
      });
    });

    const initial = document.querySelector('.auth-tab.active') || tabs[0];
    if (initial) activateTab(initial);
  }

  function wireForm(formId, messageId, successText) {
    const form = document.getElementById(formId);
    const message = document.getElementById(messageId);
    if (!form || !message) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      message.classList.remove('error', 'success');

      if (!form.checkValidity()) {
        message.textContent = 'Please complete all required fields correctly.';
        message.classList.add('error');
        form.reportValidity();
        return;
      }

      message.textContent = successText;
      message.classList.add('success');
      form.reset();
    });
  }

  wireForm('signup-form', 'signup-status', 'Account draft created successfully. You will receive a confirmation email shortly.');
  wireForm('signin-form', 'signin-status', 'Sign in accepted. Redirecting to your dashboard...');
  wireForm('contact-form', 'contact-status', 'Thanks for contacting us. We will reply within 1 business day.');
  wireForm('feedback-form', 'feedback-status', 'Thanks for your feedback. It has been submitted successfully.');
})();
