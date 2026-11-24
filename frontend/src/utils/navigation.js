export function navigate(to) {
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
