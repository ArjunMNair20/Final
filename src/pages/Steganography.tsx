import { useRef, useState, useCallback, useEffect } from 'react';
import { Lock, Download, UploadCloud, Eye, X, FileImage, Volume2, FileText, Check, Info } from 'lucide-react';

function dataURLToBlob(dataurl: string) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function utf8ToBytes(str: string) {
  return new TextEncoder().encode(str);
}

function bytesToUtf8(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

export default function Steganography() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const secretFileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [decoded, setDecoded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  const [stegoType, setStegoType] = useState<'text' | 'image' | 'audio'>('text');
  const [secretFile, setSecretFile] = useState<File | null>(null);
  const [secretPreview, setSecretPreview] = useState<string | null>(null);
  const [decodedType, setDecodedType] = useState<'text' | 'image' | 'audio' | null>(null);
  const [decodedMime, setDecodedMime] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastHideTimerRef = useRef<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const loadImageToCanvas = (file: File) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = URL.createObjectURL(file);
    });
  };

  const drawImageOnCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    // resize canvas to image (limit large images to reasonable size to avoid memory issues)
    const maxDim = 2048;
    let w = img.width;
    let h = img.height;
    if (w > maxDim || h > maxDim) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const estimateCapacityBytes = useCallback((mimeLen = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const pixels = canvas.width * canvas.height;
    const capacityBits = pixels * 3; // R,G,B LSBs
    const capacityBytes = Math.floor(capacityBits / 8) - (1 + 1 + mimeLen + 4); // reserve type(1)+mimeLen(1)+mime+length(4)
    return Math.max(0, capacityBytes);
  }, []);

  const handleFile = async (file?: File) => {
    setError(null);
    setDecoded(null);
    setEmbedded(false);
    if (!file) return;
    try {
      const img = await loadImageToCanvas(file);
      drawImageOnCanvas(img);
      // Use PNG preview of canvas for consistency (lossless)
      const canvas = canvasRef.current!;
      setFilePreview(canvas.toDataURL('image/png'));
    } catch (e) {
      setError('Failed to load image');
    }
  };

  const handleSecretFile = (file?: File) => {
    // revoke previous preview
    try { if (secretPreview && secretPreview.startsWith('blob:')) URL.revokeObjectURL(secretPreview); } catch {}
    if (!file) {
      setSecretFile(null);
      setSecretPreview(null);
      return;
    }
    setSecretFile(file || null);
    try {
      const url = URL.createObjectURL(file);
      setSecretPreview(url);
    } catch {
      setSecretPreview(null);
    }
  };

  // progress simulation for better UX while processing
  const startProgress = () => {
    setProgress(0);
    if (progressRef.current) window.clearInterval(progressRef.current);
    progressRef.current = window.setInterval(() => {
      setProgress((p) => Math.min(90, p + Math.floor(Math.random() * 8) + 3));
    }, 220) as unknown as number;
  };

  const finishProgress = () => {
    try { if (progressRef.current) window.clearInterval(progressRef.current); } catch {}
    progressRef.current = null;
    setProgress(100);
    setTimeout(() => setProgress(0), 500);
  };

  useEffect(() => {
    return () => {
      try { if (progressRef.current) window.clearInterval(progressRef.current); } catch {}
      try { if (secretPreview && secretPreview.startsWith('blob:')) URL.revokeObjectURL(secretPreview); } catch {}
      try { if (decoded && typeof decoded === 'string' && decoded.startsWith('blob:')) URL.revokeObjectURL(decoded); } catch {}
      try { if (filePreview && filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview); } catch {}
      try { if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current); } catch {}
      try { if (toastHideTimerRef.current) window.clearTimeout(toastHideTimerRef.current); } catch {}
    };
  }, [secretPreview, decoded, filePreview]);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    try { if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current); } catch {}
    try { if (toastHideTimerRef.current) window.clearTimeout(toastHideTimerRef.current); } catch {}
    // start hide animation slightly before removal so it's gone at 3000ms
    toastHideTimerRef.current = window.setTimeout(() => setToastVisible(false), 2500) as unknown as number;
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3000) as unknown as number;
  };

  const embedSecret = async () => {
    setError(null);
    setProcessing(true);
    startProgress();
    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const width = canvas.width;
      const height = canvas.height;
      if (!width || !height) {
        setError('No image loaded');
        setProcessing(false);
        return;
      }

      let secretBytes: Uint8Array;
      let mime = '';
      if (stegoType === 'text') {
        secretBytes = utf8ToBytes(secret);
      } else {
        if (!secretFile) {
          setError('No secret file selected');
          setProcessing(false);
          return;
        }
        const ab = await secretFile.arrayBuffer();
        secretBytes = new Uint8Array(ab);
        mime = secretFile.type || '';
      }
      const length = secretBytes.length;
      const mimeBytes = utf8ToBytes(mime);
      if (mimeBytes.length > 255) {
        setError('Secret MIME type too long');
        setProcessing(false);
        return;
      }
      const capacityBytes = estimateCapacityBytes(mimeBytes.length);
      if (length === 0) {
        setError('Secret is empty');
        setProcessing(false);
        return;
      }
      if (length > capacityBytes) {
        setError(`Secret too long. Max bytes: ${capacityBytes}`);
        setProcessing(false);
        return;
      }

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data; // RGBA

      // build payload: type(1) | mimeLen(1) | mime | length(4) | data
      const typeCode = stegoType === 'text' ? 1 : stegoType === 'image' ? 2 : 3;
      const payload = new Uint8Array(1 + 1 + mimeBytes.length + 4 + length);
      payload[0] = typeCode & 0xff;
      payload[1] = mimeBytes.length & 0xff;
      payload.set(mimeBytes, 2);
      const off = 2 + mimeBytes.length;
      payload[off + 0] = (length >>> 24) & 0xff;
      payload[off + 1] = (length >>> 16) & 0xff;
      payload[off + 2] = (length >>> 8) & 0xff;
      payload[off + 3] = length & 0xff;
      payload.set(secretBytes, off + 4);

      // embed bits into LSB of R,G,B channels sequentially
      let dataIdx = 0; // index in data array
      for (let b = 0; b < payload.length; b++) {
        for (let bit = 7; bit >= 0; bit--) {
          // find next non-alpha channel
          while ((dataIdx + 1) % 4 === 0) dataIdx++;
          const bitVal = (payload[b] >> bit) & 1;
          data[dataIdx] = (data[dataIdx] & 0xfe) | bitVal;
          dataIdx++;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setFilePreview(dataUrl);
      setEmbedded(true);
      showToast('Embedding completed');
      finishProgress();
      setProcessing(false);
    } catch (e) {
      setError('Failed to embed secret');
      finishProgress();
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!filePreview) return;
    const a = document.createElement('a');
    a.href = filePreview;
    a.download = 'stego-image.png';
    a.click();
  };

  const decodeSecret = async () => {
    setError(null);
    setDecoded(null);
    setProcessing(true);
    startProgress();
    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const width = canvas.width;
      const height = canvas.height;
      if (!width || !height) {
        setError('No image loaded');
        setProcessing(false);
        return;
      }
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // read type (8 bits)
      let dataIdx = 0;
      const readBit = () => {
        while ((dataIdx + 1) % 4 === 0) dataIdx++;
        const bit = data[dataIdx] & 1;
        dataIdx++;
        return bit;
      };

      const readByte = () => {
        let val = 0;
        for (let i = 0; i < 8; i++) {
          val = (val << 1) | readBit();
        }
        return val & 0xff;
      };

      const typeCode = readByte();
      const mimeLen = readByte();
      const mimeBytes = new Uint8Array(mimeLen);
      for (let i = 0; i < mimeLen; i++) {
        mimeBytes[i] = readByte();
      }
      const mime = mimeLen > 0 ? bytesToUtf8(mimeBytes) : '';

      // read 32-bit length
      const headerBytes = new Uint8Array(4);
      for (let i = 0; i < 4; i++) {
        headerBytes[i] = readByte();
      }
      const length = (headerBytes[0] << 24) | (headerBytes[1] << 16) | (headerBytes[2] << 8) | headerBytes[3];
      const capacityBytes = estimateCapacityBytes(mimeLen);
      if (length <= 0 || length > capacityBytes) {
        setError('No hidden message found or invalid length');
        setProcessing(false);
        return;
      }

      const payload = new Uint8Array(length);
      for (let b = 0; b < length; b++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          byte = (byte << 1) | readBit();
        }
        payload[b] = byte;
      }

      if (typeCode === 1) {
        const message = bytesToUtf8(payload);
        setDecoded(message);
        setDecodedType('text');
        setDecodedMime(null);
      } else if (typeCode === 2) {
        const blob = new Blob([payload], { type: mime || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        setDecoded(url);
        setDecodedType('image');
        setDecodedMime(mime || 'application/octet-stream');
      } else if (typeCode === 3) {
        const blob = new Blob([payload], { type: mime || 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setDecoded(url);
        setDecodedType('audio');
        setDecodedMime(mime || 'audio/mpeg');
      } else {
        setError('Unknown embedded type');
      }
      finishProgress();
      setProcessing(false);
    } catch (e) {
      setError('Failed to decode secret');
      finishProgress();
      setProcessing(false);
    }
  };

  const clearAll = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFilePreview(null);
    setSecret('');
    // revoke any created blob urls
    try {
      if (decoded && decoded.startsWith('blob:')) URL.revokeObjectURL(decoded);
    } catch {}
    try {
      if (filePreview && filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    } catch {}
    setDecoded(null);
    setError(null);
    setEmbedded(false);
    setSecretFile(null);
    setDecodedType(null);
    setDecodedMime(null);
    // clear file inputs' displayed names/values
    try { if (fileInputRef.current) fileInputRef.current.value = ''; } catch {}
    try { if (secretFileInputRef.current) secretFileInputRef.current.value = ''; } catch {}
    try { if (secretPreview && secretPreview.startsWith('blob:')) URL.revokeObjectURL(secretPreview); } catch {}
    setSecretPreview(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="relative space-y-6 p-6 bg-gradient-to-br from-[#0f1628]/80 to-[#0a0f1a]/60 rounded-xl shadow-xl border border-[#1e2a3f]/40 transition-all">
      <div>
        <h1 className="text-3xl font-bold text-[#8B5CF6] mb-2 flex items-center gap-2">
          <Lock size={28} /> StegoStudio
        </h1>
        <p className="text-gray-400">StegoStudio — Embed & extract text, images, or audio inside images (client-side). Prefer PNG (lossless).</p>
      </div>
      <button
        onClick={() => setShowHelp((s) => !s)}
        aria-label="Help about StegoStudio"
        className="absolute right-4 top-4 p-2 rounded-full bg-[#1e2a3f]/40 border border-[#1e2a3f]/50 text-gray-300 hover:bg-[#1e2a3f]/60 transition"
      >
        <Info size={18} />
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => setMode('encode')}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-transform transform ${mode === 'encode' ? 'bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/50 scale-105' : 'bg-[#1e2a3f]/50 border-[#1e2a3f]/30 hover:scale-105'}`}
        >
          Embed
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-transform transform ${mode === 'decode' ? 'bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/50 scale-105' : 'bg-[#1e2a3f]/50 border-[#1e2a3f]/30 hover:scale-105'}`}
        >
          Decode
        </button>
        <button onClick={clearAll} className="px-3 py-2 rounded-lg border text-sm bg-red-600/10 flex items-center gap-2 transition-transform hover:scale-105">Clear <X size={14} /></button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-xs text-gray-400">Image</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0] || undefined)}
              className="flex-1"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-lg bg-[#1e2a3f]/50"
            >
              <UploadCloud size={16} />
            </button>
          </div>

          <div className="border border-[#1e2a3f]/40 rounded-lg p-3 bg-[#0f1628]/30 transition-shadow hover:shadow-lg">
            {filePreview ? (
              <img src={filePreview} alt="preview" className="max-w-full max-h-60 object-contain rounded transition-transform duration-300 hover:scale-105" />
            ) : (
              <div className="text-gray-400 text-sm">No image selected — drag & drop or upload. PNG recommended.</div>
            )}
          </div>

          <div className="text-xs text-gray-400">
            Capacity: <span className="font-semibold text-[#0284c7]">{estimateCapacityBytes(secretFile ? utf8ToBytes(secretFile.type).length : 0)} bytes</span> available for secret (approx). Header reserves type/mime/length bytes.
          </div>

          {mode === 'encode' && (
            <>
              <label className="block text-xs text-gray-400">Secret Type</label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setStegoType('text')}
                  className={`px-3 py-2 rounded border text-sm ${stegoType === 'text' ? 'bg-[#06b6d4]/20 text-[#0284c7] border-[#06b6d4]/50' : 'bg-[#1e2a3f]/50 border-[#1e2a3f]/30'}`}
                ><FileText size={16}/> Text</button>
                <button
                  onClick={() => setStegoType('image')}
                  className={`px-3 py-2 rounded border text-sm ${stegoType === 'image' ? 'bg-[#06b6d4]/20 text-[#0284c7] border-[#06b6d4]/50' : 'bg-[#1e2a3f]/50 border-[#1e2a3f]/30'}`}
                ><FileImage size={16}/> Image</button>
                <button
                  onClick={() => setStegoType('audio')}
                  className={`px-3 py-2 rounded border text-sm ${stegoType === 'audio' ? 'bg-[#06b6d4]/20 text-[#0284c7] border-[#06b6d4]/50' : 'bg-[#1e2a3f]/50 border-[#1e2a3f]/30'}`}
                ><Volume2 size={16}/> Audio</button>
              </div>

              {stegoType === 'text' && (
                <>
                  <label className="block text-xs text-gray-400">Secret Text</label>
                  <textarea value={secret} onChange={(e) => setSecret(e.target.value)} className="w-full p-2 rounded bg-black/30 text-sm border border-[#1e2a3f]/30" rows={6} />
                </>
              )}

              {stegoType !== 'text' && (
                <>
                  <label className="block text-xs text-gray-400">Secret File ({stegoType === 'image' ? 'image/*' : 'audio/*'})</label>
                  <input ref={secretFileInputRef} type="file" accept={stegoType === 'image' ? 'image/*' : 'audio/*'} onChange={(e) => handleSecretFile(e.target.files?.[0] || undefined)} />
                  {secretFile && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-300">Selected: {secretFile.name} • {Math.round(secretFile.size/1024)} KB • {secretFile.type || 'unknown'}</div>
                      {stegoType === 'image' && secretPreview && (
                        <img src={secretPreview} alt="secret preview" className="max-w-full max-h-32 object-contain mt-2" />
                      )}
                      {stegoType === 'audio' && secretPreview && (
                        <audio controls src={secretPreview} className="mt-2 w-full" />
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2 mt-3">
                <button disabled={processing || !filePreview} onClick={embedSecret} className="px-4 py-2 rounded bg-[#06b6d4]/20 text-[#0284c7] disabled:opacity-50">Embed</button>
                <button disabled={!embedded} onClick={downloadImage} className="px-4 py-2 rounded bg-green-500/20 flex items-center gap-2 disabled:opacity-50"><Download size={14}/>Download</button>
              </div>
            </>
          )}

          {mode === 'decode' && (
            <>
              <div className="flex gap-2">
                <button disabled={processing || !filePreview} onClick={decodeSecret} className="px-4 py-2 rounded bg-[#06b6d4]/20 text-[#0284c7] flex items-center gap-2 disabled:opacity-50"><Eye size={14}/>Decode</button>
              </div>
              {decoded !== null && decodedType === 'text' && (
                <div className="mt-3 p-3 rounded bg-[#0f1628]/50 border border-[#1e2a3f]/30">
                  <label className="text-xs text-gray-400">Decoded Text</label>
                  <pre className="whitespace-pre-wrap text-sm mt-2 text-gray-300">{decoded}</pre>
                </div>
              )}

              {decoded !== null && decodedType === 'image' && (
                <div className="mt-3 p-3 rounded bg-[#0f1628]/50 border border-[#1e2a3f]/30">
                  <label className="text-xs text-gray-400">Decoded Image</label>
                  <img src={decoded} alt="decoded" className="max-w-full mt-2" />
                  <div className="mt-2">
                    <a href={decoded} download={`decoded-image${decodedMime && decodedMime.includes('png') ? '.png' : ''}`} className="px-3 py-2 rounded bg-green-500/20 inline-block">Download Image</a>
                  </div>
                </div>
              )}

              {decoded !== null && decodedType === 'audio' && (
                <div className="mt-3 p-3 rounded bg-[#0f1628]/50 border border-[#1e2a3f]/30">
                  <label className="text-xs text-gray-400">Decoded Audio</label>
                  <audio controls src={decoded} className="w-full mt-2" />
                  <div className="mt-2">
                    <a href={decoded} download={`decoded-audio${decodedMime && decodedMime.includes('mpeg') ? '.mp3' : '.bin'}`} className="px-3 py-2 rounded bg-green-500/20 inline-block">Download Audio</a>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}
        </div>

        <div>
          <div className="border border-[#1e2a3f]/40 rounded-lg p-3 bg-gradient-to-br from-[#0f1628]/20 to-[#0a0f1a]/10 shadow-inner">
            <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', maxHeight: 420 }} className="rounded" />
          </div>
        </div>
      </div>
      {processing && (
        <div className="absolute inset-0 bg-black/40 z-40 flex items-center justify-center rounded-xl">
          <div className="w-80 p-4 bg-[#0f1628]/90 rounded-lg flex flex-col items-center gap-3 border border-[#1e2a3f]/50">
            <div className="w-12 h-12 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
            <div className="text-sm text-gray-300">Processing...</div>
            <div className="w-full bg-[#1e2a3f] rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-[#ff6b35] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-gray-400">{progress}%</div>
          </div>
        </div>
      )}
      {showHelp && (
        <div className="fixed right-6 top-20 z-50 w-80 pointer-events-auto">
          <div className="bg-[#0f1628]/95 border border-[#1e2a3f]/40 rounded-lg p-4 shadow-lg text-sm text-gray-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-[#ff6b35]" />
                <div className="font-semibold">About Steganography</div>
              </div>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-200"><X size={16} /></button>
            </div>
            <div className="mt-3 text-xs leading-relaxed text-gray-400">
              Steganography is the practice of hiding a message or data within another file or medium so that the existence of the hidden information is concealed. In digital media, tiny, imperceptible changes (for example, to image pixel values) can carry hidden data without noticeably altering the visible content.
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed right-6 top-6 z-50 pointer-events-none">
          <div
            className={`pointer-events-auto flex items-center gap-3 bg-[#ff6b35] text-white px-4 py-2 rounded-lg shadow-lg border border-[#ff6b35]/30 transform transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
          >
            <Check size={18} />
            <div className="text-sm font-medium">{toast}</div>
          </div>
        </div>
      )}
    </div>
  );
}
