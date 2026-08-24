(function() {
   'use strict';

  /* --- Canvas palette (default green) --- */
    /* Override by setting `canvasPalette` before loading this script:
       canvasPalette = { muted, light, pale, dark } — each a hex string like "#A06B45"
    */
  var defaults = {
    muted: '#7A9E76',
    light: '#A8C4A0',
    pale: '#D4E4D2',
    dark: '#2D5B3D'
   };
  var palette = Object.assign({}, defaults, typeof canvasPalette !== 'undefined' ? canvasPalette : {});

   /* --- Hero Canvas: Spatial Point Cloud Animation --- */
  var canvasWrap = document.querySelector('.hero-canvas-wrap');
  if (canvasWrap) {
    var canvas = canvasWrap.querySelector('canvas');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      var width, height;
      var points = [];
      var mouseX = 0, mouseY = 0;

      function hexToRgba(hex, alpha) {
        /* Returns "rgba(r, g, b, a)" — comma-separated, works in every browser */
        return 'rgba(' +
          parseInt(hex.slice(1, 3), 16) + ', ' +
          parseInt(hex.slice(3, 5), 16) + ', ' +
          parseInt(hex.slice(5, 7), 16) + ', ' + alpha + ')';
       }

      function resize() {
        var wrap = canvas.parentElement;
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
        var count = Math.min(Math.floor((width * height) / 5000), 250);
        for (var i = 0; i < count; i++) {
           /* Distribute in a soft sphere / organic cluster */
          var theta = Math.random() * Math.PI * 2;
          var phi = Math.acos(2 * Math.random() - 1);
          var r = 0.5 + Math.pow(Math.random(), 0.6) * 0.5;
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

        var cx = width / 2;
        var cy = height / 2;
        var scale = Math.min(width, height) * 0.35;
        var rotY = t * 0.00018;
        var rotX = 0.3 + Math.sin(t * 0.00012) * 0.15;

         /* Mouse influence (subtle) */
        var mx = (mouseX / width - 0.5) * 0.3;
        var my = (mouseY / height - 0.5) * 0.3;

        points.forEach(function(p) {
           /* Rotate around Y axis */
          var cosY = Math.cos(rotY);
          var sinY = Math.sin(rotY);
          var x = p.baseX * cosY - p.baseZ * sinY;
          var z = p.baseX * sinY + p.baseZ * cosY;
          var y = p.baseY;

           /* Rotate around X axis */
          var cosX = Math.cos(rotX);
          var sinX = Math.sin(rotX);
          var y2 = y * cosX - z * sinX;
          var z2 = y * sinX + z * cosX;
          y = y2;
          z = z2;

           /* Add gentle breathing */
          var breathe = 1 + Math.sin(t * 0.001 * p.speed + p.phase) * 0.04;

           /* Project */
          var perspective = 2 / (2 + z2);
          var px = x * scale * perspective + cx;
          var py = y * scale * perspective + cy;

           /* Mouse parallax */
          var parallaxX = (px - cx) * (0.5 + mx);
          var parallaxY = (py - cy) * (0.5 + my);

          var finalX = px + parallaxX * 0.15;
          var finalY = py + parallaxY * 0.15;

           /* Depth-based opacity */
          var depthOpacity = Math.max(0, p.opacity * perspective);

           /* Draw soft translucent sphere */
          ctx.beginPath();
          ctx.arc(finalX, finalY, p.radius * perspective * breathe, 0, Math.PI * 2);

           /* Gradient for glassy effect — palette from CSS vars (or overrides) */
          var gradient = ctx.createRadialGradient(
            finalX - p.radius * 0.3 * breathe,
            finalY - p.radius * 0.3 * breathe,
            0,
            finalX,
            finalY,
            p.radius * perspective * breathe
           );
          gradient.addColorStop(0, hexToRgba(palette.muted, depthOpacity * 0.7));
          gradient.addColorStop(0.5, hexToRgba(palette.light, depthOpacity * 0.35));
          gradient.addColorStop(1, hexToRgba(palette.pale, depthOpacity * 0.05));

          ctx.fillStyle = gradient;
          ctx.fill();

           /* Subtle connection lines for nearby points */
          if (z2 > -0.3) {
            ctx.beginPath();
            ctx.arc(finalX, finalY, 1, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(palette.dark, depthOpacity * 0.5);
            ctx.fill();
           }
         });

        requestAnimationFrame(draw);
       }

      window.addEventListener('resize', function() {
        resize();
        initPoints();
       });

      window.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
       }, { passive: true });

      resize();
      initPoints();
      requestAnimationFrame(draw);
     }
   }

})();
