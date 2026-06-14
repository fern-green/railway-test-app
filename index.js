const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>fern green</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #010a02;
    }

    canvas {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: block;
    }

    .vignette {
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(1,10,2,0.82) 100%);
      pointer-events: none;
      z-index: 5;
    }

    .center {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
      z-index: 10;
    }

    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(3.5rem, 13vw, 11rem);
      font-weight: 300;
      font-style: italic;
      color: rgba(204, 242, 214, 0.90);
      letter-spacing: 0.18em;
      line-height: 1;
      text-shadow:
        0 0 40px rgba(90, 195, 115, 0.45),
        0 0 100px rgba(55, 150, 75, 0.25),
        0 0 200px rgba(30, 110, 55, 0.12);
      opacity: 0;
      animation: appear 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.8s;
    }

    @keyframes appear {
      0%   { opacity: 0; filter: blur(12px); }
      60%  { filter: blur(1px); }
      100% { opacity: 1; filter: blur(0px); }
    }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <div class="vignette"></div>
  <div class="center"><h1>fern green</h1></div>

  <script>
    var canvas = document.getElementById('c');
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      ctx.fillStyle = 'rgb(1,10,2)';
      ctx.fillRect(0, 0, W, H);
    }
    resize();
    window.addEventListener('resize', resize);

    /* multi-octave sine noise — organic but no external library */
    function fieldAngle(x, y, t) {
      var f1 = Math.sin(x * 0.0065 + t * 0.16) * Math.cos(y * 0.0080 + t * 0.13);
      var f2 = Math.sin(x * 0.0130 - y * 0.0095 + t * 0.30) * 0.55;
      var f3 = Math.cos(x * 0.0028 + y * 0.0042 + t * 0.065) * 0.40;
      var f4 = Math.sin((x + y) * 0.0060 + t * 0.22) * 0.30;
      return (f1 + f2 + f3 + f4) * Math.PI * 1.5;
    }

    var PALETTE = [
      [18,  62,  28],
      [28,  85,  42],
      [42, 110,  55],
      [62, 140,  72],
      [84, 168,  92],
      [108,195, 112],
      [50, 125,  62],
      [35,  98,  50],
    ];

    var NUM = 2000;
    var px  = new Float32Array(NUM);
    var py  = new Float32Array(NUM);
    var pvx = new Float32Array(NUM);
    var pvy = new Float32Array(NUM);
    var pli = new Float32Array(NUM);   /* life 0..1 */
    var pml = new Float32Array(NUM);   /* max-life */
    var psz = new Float32Array(NUM);
    var psp = new Float32Array(NUM);
    var pcr = new Uint8Array(NUM);
    var pcg = new Uint8Array(NUM);
    var pcb = new Uint8Array(NUM);

    function initParticle(i) {
      var c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      px[i]  = Math.random() * (W || window.innerWidth);
      py[i]  = Math.random() * (H || window.innerHeight);
      pvx[i] = 0; pvy[i] = 0;
      pli[i] = Math.random();
      pml[i] = 0.35 + Math.random() * 0.65;
      psz[i] = 0.5 + Math.random() * 2.0;
      psp[i] = 0.55 + Math.random() * 1.0;
      pcr[i] = c[0]; pcg[i] = c[1]; pcb[i] = c[2];
    }

    for (var i = 0; i < NUM; i++) initParticle(i);

    var t = 0;

    function frame() {
      /* slowly erase trails */
      ctx.fillStyle = 'rgba(1,10,2,0.09)';
      ctx.fillRect(0, 0, W, H);

      t += 0.0028;

      for (var i = 0; i < NUM; i++) {
        var angle = fieldAngle(px[i], py[i], t);
        var spd   = psp[i] * 0.11;

        pvx[i] = pvx[i] * 0.86 + Math.cos(angle) * spd;
        pvy[i] = pvy[i] * 0.86 + Math.sin(angle) * spd;

        px[i] += pvx[i];
        py[i] += pvy[i];
        pli[i] += 0.0038;

        /* wrap edges */
        if (px[i] < -4) px[i] += W + 8;
        else if (px[i] > W + 4) px[i] -= W + 8;
        if (py[i] < -4) py[i] += H + 8;
        else if (py[i] > H + 4) py[i] -= H + 8;

        if (pli[i] >= pml[i]) initParticle(i);

        var fade = Math.sin((pli[i] / pml[i]) * Math.PI);
        var a    = (fade * 0.80).toFixed(3);

        ctx.fillStyle = 'rgba(' + pcr[i] + ',' + pcg[i] + ',' + pcb[i] + ',' + a + ')';
        ctx.beginPath();
        ctx.arc(px[i], py[i], psz[i], 0, 6.2832);
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    frame();
  </script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(html);
});

app.get('/api/info', (req, res) => {
  res.json({ port: PORT, uptime: process.uptime() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
