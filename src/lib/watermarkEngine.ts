/**
 * DataSeal Watermarking Engine
 * Supports both visible and invisible watermarking with advanced features
 */

export interface VisibleWatermarkOptions {
  text: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  rotation: number;
}

export interface InvisibleWatermarkOptions {
  message: string;
  strength: 'low' | 'medium' | 'high';
}

export interface WatermarkResult {
  dataUrl: string;
  size: number;
  timestamp: number;
}

// Utility to load image
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

// Create canvas
function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

// Apply visible watermark with text and positioning
export async function applyVisibleWatermark(imageUrl: string, options: VisibleWatermarkOptions): Promise<WatermarkResult> {
  const image = await loadImage(imageUrl);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d')!;

  // Draw original image
  ctx.drawImage(image, 0, 0);

  // Save context state
  ctx.save();

  // Set watermark properties
  ctx.globalAlpha = options.opacity;
  ctx.fillStyle = options.color;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 3;
  ctx.font = `bold ${options.fontSize}px ${options.fontFamily}`;
  ctx.textBaseline = 'middle';

  // Calculate position
  const positions: Record<string, [number, number, CanvasTextAlign, CanvasTextBaseline]> = {
    'top-left': [20, 20 + options.fontSize / 2, 'left', 'top'],
    'top-center': [canvas.width / 2, 20 + options.fontSize / 2, 'center', 'top'],
    'top-right': [canvas.width - 20, 20 + options.fontSize / 2, 'right', 'top'],
    'center-left': [20, canvas.height / 2, 'left', 'middle'],
    'center': [canvas.width / 2, canvas.height / 2, 'center', 'middle'],
    'center-right': [canvas.width - 20, canvas.height / 2, 'right', 'middle'],
    'bottom-left': [20, canvas.height - 20 - options.fontSize / 2, 'left', 'bottom'],
    'bottom-center': [canvas.width / 2, canvas.height - 20 - options.fontSize / 2, 'center', 'bottom'],
    'bottom-right': [canvas.width - 20, canvas.height - 20 - options.fontSize / 2, 'right', 'bottom'],
  };

  const [px, py, align, baseline] = positions[options.position] || [canvas.width / 2, canvas.height / 2, 'center', 'middle'];
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  // Apply rotation if needed
  if (options.rotation !== 0) {
    ctx.translate(px, py);
    ctx.rotate((options.rotation * Math.PI) / 180);
    ctx.translate(-px, -py);
  }

  // Draw watermark text with stroke for visibility
  ctx.strokeText(options.text, px, py);
  ctx.fillText(options.text, px, py);

  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');
  return {
    dataUrl,
    size: Math.round(dataUrl.length / 1024),
    timestamp: Date.now(),
  };
}

// Embed invisible watermark using LSB steganography
export async function applyInvisibleWatermark(imageUrl: string, options: InvisibleWatermarkOptions): Promise<WatermarkResult> {
  const image = await loadImage(imageUrl);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Encode message
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(options.message);
  const strength = options.strength === 'high' ? 2 : options.strength === 'medium' ? 1 : 0;

  // Create bit array with length prefix
  const bits: number[] = [];
  const lengthBuffer = new Uint32Array([messageBytes.length]);
  const lengthView = new Uint8Array(lengthBuffer.buffer);

  // Add length bytes
  for (let i = 0; i < 4; i++) {
    const byte = lengthView[i];
    for (let bit = 0; bit < 8; bit++) {
      bits.push((byte >> bit) & 1);
    }
  }

  // Add message bytes
  for (const byte of messageBytes) {
    for (let bit = 0; bit < 8; bit++) {
      bits.push((byte >> bit) & 1);
    }
  }

  // Embed into blue channel LSB
  let bitIndex = 0;
  const channels = strength + 1;

  for (let i = 0; i < data.length && bitIndex < bits.length; i += 4) {
    // Use blue and optionally green/alpha based on strength
    for (let ch = 0; ch < channels && bitIndex < bits.length; ch++) {
      const index = i + 2 + ch;
      if (index < data.length) {
        data[index] = (data[index] & (0xff << (ch + 1))) | bits[bitIndex];
        bitIndex++;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');

  return {
    dataUrl,
    size: Math.round(dataUrl.length / 1024),
    timestamp: Date.now(),
  };
}

// Extract invisible watermark
export async function extractInvisibleWatermark(imageUrl: string): Promise<{
  message: string;
  confidence: number;
}> {
  const image = await loadImage(imageUrl);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Extract bits from blue channel
  const bits: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    bits.push(data[i + 2] & 1); // Blue channel LSB
  }

  if (bits.length < 32) {
    throw new Error('Image too small to contain watermark');
  }

  // Extract length (first 32 bits)
  const lengthBytes = new Uint8Array(4);
  for (let i = 0; i < 32; i++) {
    const byteIndex = Math.floor(i / 8);
    const bitIndex = i % 8;
    lengthBytes[byteIndex] |= (bits[i] << bitIndex);
  }

  const view = new DataView(lengthBytes.buffer);
  const messageLength = view.getUint32(0, true);

  if (messageLength > 10000 || messageLength === 0) {
    throw new Error('Invalid watermark data');
  }

  // Extract message bytes
  const messageBits = bits.slice(32, 32 + messageLength * 8);
  const messageBytes = new Uint8Array(messageLength);

  for (let i = 0; i < messageLength; i++) {
    let byte = 0;
    for (let bit = 0; bit < 8; bit++) {
      const bitIndex = i * 8 + bit;
      if (bitIndex < messageBits.length) {
        byte |= (messageBits[bitIndex] << bit);
      }
    }
    messageBytes[i] = byte;
  }

  // Decode UTF-8
  const decoder = new TextDecoder();
  const message = decoder.decode(messageBytes);

  return {
    message,
    confidence: 0.95,
  };
}

// Simulate attacks
export async function simulateCropAttack(imageUrl: string, cropPercentage: number = 80): Promise<string> {
  const image = await loadImage(imageUrl);
  const newWidth = Math.round((image.width * cropPercentage) / 100);
  const newHeight = Math.round((image.height * cropPercentage) / 100);

  const canvas = createCanvas(newWidth, newHeight);
  const ctx = canvas.getContext('2d')!;

  const startX = Math.round((image.width - newWidth) / 2);
  const startY = Math.round((image.height - newHeight) / 2);

  ctx.drawImage(image, startX, startY, newWidth, newHeight, 0, 0, newWidth, newHeight);
  return canvas.toDataURL('image/png');
}

export async function simulateNoiseAttack(imageUrl: string, intensity: number = 0.1): Promise<string> {
  const image = await loadImage(imageUrl);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < intensity) {
      const noise = Math.floor(Math.random() * 100) - 50;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

// Detect watermark presence (returns true/false)
export async function detectWatermark(imageUrl: string): Promise<boolean> {
  try {
    const image = await loadImage(imageUrl);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple detection: check for LSB patterns
    let lsbCount = 0;
    for (let i = 0; i < Math.min(data.length, 1000); i += 4) {
      if ((data[i + 2] & 1) === 1) lsbCount++;
    }

    // If LSB randomness is higher than expected, watermark might be present
    return lsbCount > 400;
  } catch {
    return false;
  }
}
