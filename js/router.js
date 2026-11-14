(function () {
  const routes = ['home', 'profil', 'project', 'kontak'];
  const defaultRoute = 'home';

  function parseHash() {
    const raw = window.location.hash.replace(/^#\/?/, '');
    const route = raw.split('/')[0] || defaultRoute;
    return routes.includes(route) ? route : defaultRoute;
  }

  function render(route) {
    const app = document.getElementById('app');
    const renderer = window.PAGES[route];
    if (!renderer) return;
    app.innerHTML = renderer();

    // Navbar active state
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.dataset.route === route);
    });

    // Dot indicator
    const dots = document.getElementById('dot-indicator');
    dots.innerHTML = '';
    routes.forEach(r => {
      const d = document.createElement('span');
      d.className = 'dot' + (r === route ? ' active' : '');
      d.title = r;
      d.addEventListener('click', () => { window.location.hash = '#/' + r; });
      dots.appendChild(d);
    });

    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function handleHashChange() {
    render(parseHash());
  }

  window.addEventListener('hashchange', handleHashChange);
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.location.hash) window.location.hash = '#/home';
    handleHashChange();
  });
})();
