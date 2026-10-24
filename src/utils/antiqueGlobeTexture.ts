import * as THREE from 'three';

/**
 * Procedurally generates a high-resolution, antique illuminated manuscript style
 * equirectangular texture map for the globe.
 * Uses antique gold graticules, ocean stippling, and stylized landmasses.
 */
export function generateAntiqueGlobeTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Midnight Ocean background with subtle vignette and parchment stippling
  const oceanGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width * 0.7);
  oceanGrad.addColorStop(0, '#0F1E36');
  oceanGrad.addColorStop(0.5, '#0B1526');
  oceanGrad.addColorStop(1, '#060B14');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ocean wave stipple rings / rhumb lines
  ctx.strokeStyle = 'rgba(214, 179, 107, 0.04)';
  ctx.lineWidth = 1;
  for (let r = 50; r < 900; r += 120) {
    ctx.beginPath();
    ctx.arc(width * 0.25, height * 0.5, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.5, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Helper: Convert (lng, lat) in [-180..180, 90..-90] to (x, y) on equirectangular canvas
  const toXY = (lng: number, lat: number): [number, number] => {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  // 2. Draw Continent Landmasses in Deep Forest & Antique Gold Parchment Tones
  ctx.fillStyle = '#1A332B'; // Deep antique forest
  ctx.strokeStyle = '#D6B36B'; // Antique gold coastline
  ctx.lineWidth = 1.5;

  const drawPolygon = (points: [number, number][]) => {
    ctx.beginPath();
    points.forEach(([lng, lat], i) => {
      const [x, y] = toXY(lng, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // --- Eurasia & Africa ---
  // Europe
  drawPolygon([
    [-9, 36], [-9, 43], [-2, 44], [-5, 48], [-1, 50], [5, 53], [10, 54], [8, 57], [12, 58],
    [24, 70], [30, 71], [40, 67], [50, 68], [60, 60], [50, 48], [40, 44], [30, 46], [26, 40],
    [22, 38], [15, 38], [12, 44], [4, 43], [3, 42], [-3, 36]
  ]);

  // British Isles
  drawPolygon([[-5, 50], [-1, 51], [1, 52], [0, 58], [-3, 58], [-5, 55], [-6, 52]]);
  drawPolygon([[-10, 51], [-6, 52], [-6, 55], [-10, 54]]);

  // Scandinavia / Northern
  drawPolygon([[5, 58], [10, 58], [18, 59], [22, 65], [28, 70], [20, 68], [12, 64], [5, 60]]);

  // Asia / Siberia / East Asia
  drawPolygon([
    [50, 68], [70, 73], [100, 76], [140, 72], [170, 66], [170, 60], [160, 55], [142, 50],
    [130, 42], [122, 38], [120, 30], [115, 22], [108, 16], [104, 10], [100, 4], [98, 10],
    [92, 18], [88, 22], [80, 20], [70, 22], [60, 25], [52, 28], [48, 32], [50, 45], [60, 55]
  ]);

  // Korean Peninsula
  drawPolygon([[124, 40], [129, 42], [130, 36], [128, 34], [125, 36], [124, 38]]);

  // Japanese Archipelago
  drawPolygon([[130, 32], [136, 35], [140, 39], [142, 44], [145, 44], [141, 38], [133, 33]]);

  // Indian Subcontinent
  drawPolygon([
    [68, 24], [72, 20], [75, 14], [77, 8], [80, 12], [84, 18], [88, 22], [78, 28], [72, 28]
  ]);

  // Sri Lanka
  drawPolygon([[80, 6], [82, 7], [81, 10], [79, 9]]);

  // Middle East & Arabian Peninsula
  drawPolygon([
    [34, 31], [40, 35], [48, 30], [54, 25], [60, 24], [55, 18], [50, 13], [44, 13], [38, 20], [35, 28]
  ]);

  // Africa
  drawPolygon([
    [-5, 36], [10, 37], [25, 32], [32, 31], [40, 22], [50, 12], [42, 0], [40, -10],
    [35, -20], [28, -34], [18, -34], [12, -20], [10, -5], [3, 5], [-15, 10], [-17, 15],
    [-15, 22], [-10, 30]
  ]);
  // Madagascar
  drawPolygon([[44, -12], [50, -14], [48, -25], [44, -25]]);

  // Americas - North America
  drawPolygon([
    [-168, 65], [-150, 70], [-120, 72], [-90, 74], [-70, 60], [-55, 50], [-65, 44], [-75, 35],
    [-80, 25], [-85, 20], [-95, 16], [-105, 22], [-115, 30], [-124, 40], [-128, 50], [-140, 60], [-160, 58]
  ]);
  // Central America
  drawPolygon([[-95, 16], [-88, 14], [-83, 10], [-78, 8], [-80, 7], [-85, 10]]);
  // South America
  drawPolygon([
    [-78, 8], [-60, 10], [-40, -2], [-35, -8], [-40, -20], [-50, -35], [-65, -55], [-75, -50],
    [-72, -35], [-76, -18], [-80, -2], [-78, 5]
  ]);

  // Australia & New Zealand
  drawPolygon([
    [114, -22], [125, -14], [140, -12], [150, -22], [152, -32], [145, -38], [130, -32], [116, -34]
  ]);
  drawPolygon([[168, -38], [176, -38], [172, -45], [168, -44]]);

  // 3. Antique Parchment Cartographic Graticule (Parallels & Meridians)
  ctx.strokeStyle = 'rgba(214, 179, 107, 0.22)';
  ctx.lineWidth = 1;

  // Latitude Parallels every 15 degrees
  for (let lat = -75; lat <= 75; lat += 15) {
    const [, y] = toXY(0, lat);
    ctx.beginPath();
    ctx.setLineDash(lat === 0 ? [] : [4, 4]);
    ctx.lineWidth = lat === 0 ? 2 : 0.8;
    ctx.strokeStyle = lat === 0 ? 'rgba(214, 179, 107, 0.65)' : 'rgba(214, 179, 107, 0.2)';
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Tropics (Cancer 23.5° N, Capricorn 23.5° S) with distinctive antique dashed gold
  ctx.setLineDash([8, 4, 2, 4]);
  ctx.strokeStyle = 'rgba(214, 179, 107, 0.45)';
  ctx.lineWidth = 1.2;
  const [, yCancer] = toXY(0, 23.5);
  ctx.beginPath();
  ctx.moveTo(0, yCancer);
  ctx.lineTo(width, yCancer);
  ctx.stroke();

  const [, yCapricorn] = toXY(0, -23.5);
  ctx.beginPath();
  ctx.moveTo(0, yCapricorn);
  ctx.lineTo(width, yCapricorn);
  ctx.stroke();

  // Longitude Meridians every 30 degrees
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = 'rgba(214, 179, 107, 0.2)';
  ctx.lineWidth = 0.8;
  for (let lng = -180; lng <= 180; lng += 30) {
    const [x] = toXY(lng, 0);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.setLineDash([]); // Reset line dash

  // 4. Cartographic Labels & Antique Rose in Oceans
  ctx.font = 'italic 18px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(214, 179, 107, 0.4)';
  ctx.textAlign = 'center';

  // Ocean inscriptions
  const [atlX, atlY] = toXY(-30, 20);
  ctx.fillText('OCEANVS ATLANTICVS', atlX, atlY);

  const [indX, indY] = toXY(75, -15);
  ctx.fillText('OCEANVS INDICVS', indX, indY);

  const [pacX, pacY] = toXY(-140, -10);
  ctx.fillText('MARE PACIFICVM', pacX, pacY);

  // Compass Rose at South Pacific
  const [roseX, roseY] = toXY(-130, -35);
  ctx.strokeStyle = 'rgba(214, 179, 107, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(roseX, roseY, 28, 0, Math.PI * 2);
  ctx.stroke();

  // 8-pointed star
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const len = i % 2 === 0 ? 34 : 20;
    ctx.beginPath();
    ctx.moveTo(roseX, roseY);
    ctx.lineTo(roseX + Math.cos(ang) * len, roseY + Math.sin(ang) * len);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Procedurally generates a subtle golden celestial constellation / star field texture
 * for the outer cosmic boundary of the observatory.
 */
export function generateCelestialStarTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#050A14';
  ctx.fillRect(0, 0, size, size);

  // Draw 500 subtle glowing stars
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.5 + 0.3;
    const alpha = Math.random() * 0.7 + 0.2;

    ctx.fillStyle = i % 8 === 0 ? `rgba(214, 179, 107, ${alpha})` : `rgba(255, 247, 232, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw a few subtle constellation connector lines
  ctx.strokeStyle = 'rgba(214, 179, 107, 0.08)';
  ctx.lineWidth = 0.8;
  const constellations = [
    [[200, 300], [240, 280], [300, 310], [360, 270], [400, 300]],
    [[650, 700], [700, 680], [760, 720], [820, 690]]
  ];
  constellations.forEach((pts) => {
    ctx.beginPath();
    pts.forEach(([x, y], idx) => {
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
