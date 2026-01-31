// Beginner-friendly watermarking helpers
// - visible watermark: overlay text or logo with position & opacity
// - invisible watermark: LSB embed/extract (blue channel LSB)

export type VisibleOptions = {
  text?: string;
  logoUrl?: string;
  position?: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'diagonal';
  opacity?: number; // 0..1
  fontSize?: number; // px
  color?: string;
};

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function createCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export async function visibleWatermark(dataUrl: string, opts: VisibleOptions): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const opacity = typeof opts.opacity === 'number' ? opts.opacity : 0.35;
  const fontSize = opts.fontSize || Math.max(20, Math.min(img.width / 15, 60));
  ctx.globalAlpha = opacity;
  ctx.fillStyle = opts.color || 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize}px sans-serif`;

  if (opts.logoUrl && !opts.text) {
    try {
      const logo = await loadImage(opts.logoUrl);
      const scale = Math.min(0.25, img.width / (logo.width * 4));
      const lw = logo.width * scale;
      const lh = logo.height * scale;
      let x = img.width - lw - 20;
      let y = 20 + lh / 2;
      if (opts.position === 'top-left') { x = 20 + lw/2; y = 20 + lh/2; }
      if (opts.position === 'center') { x = img.width/2; y = img.height/2; }
      if (opts.position === 'bottom-left') { x = 20 + lw/2; y = img.height - 20 - lh/2; }
      if (opts.position === 'bottom-right') { x = img.width - lw - 20; y = img.height - 20 - lh/2; }
      ctx.globalAlpha = opacity;
      ctx.drawImage(logo, x - lw/2, y - lh/2, lw, lh);
    } catch (e) {
      // ignore logo load errors
    }
  }

  if (opts.text) {
    const text = opts.text;
    const pos = opts.position || 'bottom-right';
    ctx.save();
    
    // Draw stroke for better visibility
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    
    if (pos === 'diagonal') {
      ctx.translate(img.width/2, img.height/2);
      ctx.rotate(-Math.PI / 6);
      ctx.strokeText(text, 0, 0);
      ctx.fillText(text, 0, 0);
    } else {
      let x = img.width - 20;
      let y = img.height - 20;
      if (pos === 'top-left') { x = 20; y = 20; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; }
      if (pos === 'top-center') { x = img.width / 2; y = 20; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; }
      if (pos === 'top-right') { x = img.width - 20; y = 20; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; }
      if (pos === 'center-left') { x = 20; y = img.height / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; }
      if (pos === 'center') { x = img.width / 2; y = img.height / 2; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; }
      if (pos === 'center-right') { x = img.width - 20; y = img.height / 2; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; }
      if (pos === 'bottom-left') { x = 20; y = img.height - 20; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; }
      if (pos === 'bottom-center') { x = img.width / 2; y = img.height - 20; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; }
      if (pos === 'bottom-right') { x = img.width - 20; y = img.height - 20; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; }
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }
    ctx.restore();
  }

  // Reset alpha
  ctx.globalAlpha = 1;
  return canvas.toDataURL('image/png');
}

// LSB invisible watermarking: store length (32-bit unsigned) followed by message bytes
export async function embedLSB(dataUrl: string, message: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const encoder = new TextEncoder();
  const msgBytes = encoder.encode(message);
  const len = msgBytes.length;
  const totalBits = (4 + len) * 8; // 4 bytes for length
  const capacity = (data.length / 4); // one bit per pixel (blue channel)
  if (totalBits > capacity) throw new Error('Image too small to hold message');

  // build bit array: 4 bytes little-endian length then message bytes
  const bits: number[] = [];
  const lenBuf = new Uint8Array(4);
  const dv = new DataView(lenBuf.buffer);
  dv.setUint32(0, len, true);
  for (let i = 0; i < 4; i++) {
    const b = lenBuf[i];
    for (let bit = 0; bit < 8; bit++) bits.push((b >> bit) & 1);
  }
  for (let i = 0; i < msgBytes.length; i++) {
    const b = msgBytes[i];
    for (let bit = 0; bit < 8; bit++) bits.push((b >> bit) & 1);
  }

  // embed into blue channel LSB
  let bitIdx = 0;
  for (let px = 0; px < data.length; px += 4) {
    if (bitIdx >= bits.length) break;
    const blueIndex = px + 2;
    data[blueIndex] = (data[blueIndex] & 0xFE) | bits[bitIdx];
    bitIdx++;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

export async function extractLSB(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // read first 32 bits for length
  const bits: number[] = [];
  for (let px = 0; px < data.length; px += 4) {
    const blueIndex = px + 2;
    bits.push(data[blueIndex] & 1);
  }

  // first 32 bits -> length (little-endian)
  if (bits.length < 32) return { message: '', bytes: new Uint8Array(0) };
  let len = 0;
  for (let i = 0; i < 32; i++) {
    len |= (bits[i] << i);
  }
  const totalBits = (4 + len) * 8;
  if (totalBits > bits.length) {
    // incomplete; still try to read available bytes
  }
  const outBytes = new Uint8Array(len);
  let bitPos = 32;
  for (let b = 0; b < len; b++) {
    let val = 0;
    for (let bit = 0; bit < 8; bit++) {
      const bitVal = bitPos < bits.length ? bits[bitPos] : 0;
      val |= (bitVal << bit);
      bitPos++;
    }
    outBytes[b] = val;
  }
  const decoder = new TextDecoder();
  const message = decoder.decode(outBytes);
  return message;
}

export async function cropImage(dataUrl: string, crop: { x: number; y: number; w: number; h: number }): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = createCanvas(crop.w, crop.h);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  return canvas.toDataURL('image/png');
}

export default {
  visibleWatermark,
  embedLSB,
  extractLSB,
  cropImage,
};
