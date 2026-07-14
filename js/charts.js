export function drawBars(canvas, series) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * ratio; canvas.height = canvas.clientHeight * ratio; ctx.scale(ratio, ratio);
  const w = canvas.clientWidth, h = canvas.clientHeight; ctx.clearRect(0,0,w,h);
  const max = Math.max(1, ...series.flatMap((d) => [d.income || 0, d.expense || 0]));
  const gap = 14, group = (w - gap * (series.length + 1)) / Math.max(1, series.length);
  series.forEach((d, i) => {
    const x = gap + i * (group + gap), bw = group / 2 - 3;
    const ih = (d.income || 0) / max * (h - 38), eh = (d.expense || 0) / max * (h - 38);
    ctx.fillStyle = '#FFC107'; ctx.fillRect(x, h - ih - 24, bw, ih);
    ctx.fillStyle = '#FF5C5C'; ctx.fillRect(x + bw + 6, h - eh - 24, bw, eh);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = '11px system-ui'; ctx.fillText(d.label, x, h - 6);
  });
}
