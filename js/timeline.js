(function() {
  'use strict';

  /* --- Timeline dots: dynamic color interpolation based on bullet count --- */
  const timelineItems = document.querySelectorAll('.timeline-item');
  const totalItems = timelineItems.length;
  if (totalItems > 1) {
    /* Base colors: first item uses --green-muted, last uses --green-pale */
    const mutedR = 0x7A, mutedG = 0x9E, mutedB = 0x76;
    const paleR = 0xD4, paleG = 0xE4, paleB = 0xD2;

    timelineItems.forEach((item, i) => {
      const dot = item.querySelector('.timeline-dot');
      if (!dot) return;

      /* t: 0 = first (muted), 1 = last (pale) */
      const t = totalItems === 1 ? 0 : i / (totalItems - 1);

      /* Interpolate RGB from muted to pale */
      const r = Math.round(mutedR + (paleR - mutedR) * t);
      const g = Math.round(mutedG + (paleG - mutedG) * t);
      const b = Math.round(mutedB + (paleB - mutedB) * t);

      dot.style.background = `rgb(${r}, ${g}, ${b})`;

      /* Shadow fades with the color — opacity scales from 0.12 to 0.35 */
      const shadowOpacity = 0.12 + (0.35 - 0.12) * t;
      dot.style.boxShadow = `0 0 0 4px rgba(${r}, ${g}, ${b}, ${shadowOpacity.toFixed(2)})`;

      /* Remove .empty class — JS now handles the last-item styling */
      if (dot.classList.contains('empty')) {
        dot.classList.remove('empty');
      }
    });
  }

})();
