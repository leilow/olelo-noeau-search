/** Scroll to the results/search area, accounting for nav height. */
export function scrollToSearchBar(): void {
  const resultsStart = document.getElementById('results-start');
  if (!resultsStart) return;
  const header = document.querySelector('nav');
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const offset = resultsStart.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
  window.scrollTo({ top: offset, behavior: 'smooth' });
}
