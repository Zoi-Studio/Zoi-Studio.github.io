(function() {
  'use strict';

  /* --- Hero Canvas: Spatial Point Cloud Animation --- */
  const canvasWrap = document.querySelector('.hero-canvas-wrap');
  if (canvasWrap) {
    const canvas = canvasWrap.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let width, height;
      let points = [];
      let mouseX = 0, mouseY = 0;

      function resize() {
        const wrap = canvas.parentElement;
        width = wrap.offsetWidth;
        height = wrap.offsetHeight;
        canvas.width = width * (window.devicePixelRatio || 1);
        canvas.height = height * (window.devicePixelRatio || 1);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(
          window.devicePixelRatio || 1,
          window.devicePixelRatio || 1
        );
      }

      function initPoints() {
        points = [];
        const count = Math.min(Math.floor((width * height) / 5000), 250);
        for (let i = 0; i < count; i++) {
          /* Distribute in a soft sphere / organic cluster */
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 0.5 + Math.pow(Math.random(), 0.6) * 0.5;
          points.push({
            baseX: r * Math.sin(phi) * Math.cos(theta),
            baseY: r * Math.sin(phi) * Math.sin(theta),
            baseZ: r * Math.cos(phi),
            radius: 1.2 + Math.random() * 2.5,
            opacity: 0.15 + Math.random() * 0.45,
            speed: 0.2 + Math.random() * 0.6,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }

      function draw(t) {
        ctx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.min(width, height) * 0.35;
        const rotY = t * 0.00018;
        const rotX = 0.3 + Math.sin(t * 0.00012) * 0.15;

        /* Mouse influence (subtle) */
        const mx = (mouseX / width - 0.5) * 0.3;
        const my = (mouseY / height - 0.5) * 0.3;

        points.forEach(p => {
          /* Rotate around Y axis */
          const cosY = Math.cos(rotY);
          const sinY = Math.sin(rotY);
          let x = p.baseX * cosY - p.baseZ * sinY;
          let z = p.baseX * sinY + p.baseZ * cosY;
          let y = p.baseY;

          /* Rotate around X axis */
          const cosX = Math.cos(rotX);
          const sinX = Math.sin(rotX);
          const y2 = y * cosX - z * sinX;
          const z2 = y * sinX + z * cosX;
          y = y2;
          z = z2;

          /* Add gentle breathing */
          const breathe = 1 + Math.sin(t * 0.001 * p.speed + p.phase) * 0.04;

          /* Project */
          const perspective = 2 / (2 + z2);
          const px = x * scale * perspective + cx;
          const py = y * scale * perspective + cy;

          /* Mouse parallax */
          const parallaxX = (px - cx) * (0.5 + mx);
          const parallaxY = (py - cy) * (0.5 + my);

          const finalX = px + parallaxX * 0.15;
          const finalY = py + parallaxY * 0.15;

          /* Depth-based opacity */
          const depthOpacity = Math.max(0, p.opacity * perspective);

          /* Draw soft translucent sphere */
          ctx.beginPath();
          ctx.arc(finalX, finalY, p.radius * perspective * breathe, 0, Math.PI * 2);

          /* Gradient for glassy effect */
          const gradient = ctx.createRadialGradient(
            finalX - p.radius * 0.3 * breathe,
            finalY - p.radius * 0.3 * breathe,
            0,
            finalX,
            finalY,
            p.radius * perspective * breathe
          );
          gradient.addColorStop(0, `rgba(168, 196, 160, ${depthOpacity * 0.7})`);
          gradient.addColorStop(0.5, `rgba(122, 158, 118, ${depthOpacity * 0.35})`);
          gradient.addColorStop(1, `rgba(212, 228, 210, ${depthOpacity * 0.05})`);

          ctx.fillStyle = gradient;
          ctx.fill();

          /* Subtle connection lines for nearby points */
          if (z2 > -0.3) {
            ctx.beginPath();
            ctx.arc(finalX, finalY, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(45, 91, 61, ${depthOpacity * 0.5})`;
            ctx.fill();
          }
        });

        requestAnimationFrame(draw);
      }

      window.addEventListener('resize', () => {
        resize();
        initPoints();
      });

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });

      resize();
      initPoints();
      requestAnimationFrame(draw);
    }
  }

})();
