export function printDocument(targetId: string) {
  const target = document.getElementById(targetId);
  if (!target) {
    throw new Error(`Printable document #${targetId} was not found.`);
  }
  const printTarget = target;

  const body = document.body;
  const otherRoots = Array.from(
    document.querySelectorAll<HTMLElement>('[data-print-root]')
  ).filter((root) => root !== printTarget);
  const targetHadRootAttribute = printTarget.hasAttribute('data-print-root');

  otherRoots.forEach((root) => root.removeAttribute('data-print-root'));
  printTarget.setAttribute('data-print-root', '');
  body.classList.add('printing-document');

  let cleanupTimer = 0;

  function cleanup() {
    body.classList.remove('printing-document');
    otherRoots.forEach((root) => root.setAttribute('data-print-root', ''));
    if (!targetHadRootAttribute) printTarget.removeAttribute('data-print-root');
    window.removeEventListener('afterprint', cleanup);
    window.removeEventListener('focus', cleanup);
    if (cleanupTimer) window.clearTimeout(cleanupTimer);
  }

  window.addEventListener('afterprint', cleanup, { once: true });
  window.addEventListener('focus', cleanup, { once: true });
  cleanupTimer = window.setTimeout(cleanup, 60_000);

  try {
    window.print();
  } catch (error) {
    cleanup();
    throw error;
  }
}
