import React, { useState } from 'react';
import {
  Upload, Download, Eye, EyeOff, Shield, Zap, Copy,
  AlertCircle, CheckCircle, Loader, RotateCcw, Maximize2
} from 'lucide-react';
import {
  applyVisibleWatermark,
  applyInvisibleWatermark,
  extractInvisibleWatermark,
  simulateCropAttack,
  simulateNoiseAttack,
  detectWatermark,
  type VisibleWatermarkOptions,
} from '../lib/watermarkEngine';

type Tab = 'add' | 'verify' | 'test';
type WatermarkType = 'visible' | 'invisible';

export default function DataSealTool() {
  const [activeTab, setActiveTab] = useState<Tab>('add');
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('visible');

  // Add watermark state
  const [sourceImage, setSourceImage] = useState<string>('');
  const [watermarkedImage, setWatermarkedImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Visible watermark options
  const [visibleText, setVisibleText] = useState('© 2026 DataSeal');
  const [position, setPosition] = useState<VisibleWatermarkOptions['position']>('bottom-right');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [color, setColor] = useState('#FFFFFF');
  const [opacity, setOpacity] = useState(0.7);
  const [rotation, setRotation] = useState(0);

  // Invisible watermark options
  const [invisibleText, setInvisibleText] = useState('Owner:Anonymous');
  const [strength, setStrength] = useState<'low' | 'medium' | 'high'>('medium');

  // Verify state
  const [verifyImage, setVerifyImage] = useState<string>('');
  const [extractedText, setExtractedText] = useState('');
  const [watermarkDetected, setWatermarkDetected] = useState<boolean | null>(null);
  const [extracted, setExtracted] = useState(false);

  // Test state
  const [testImage, setTestImage] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<string>('');
  const [noisyImage, setNoisyImage] = useState<string>('');
  const [cropExtracted, setCropExtracted] = useState('');
  const [noiseExtracted, setNoiseExtracted] = useState('');

  // Utility functions
  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFile(file);
      setSourceImage(dataUrl);
      setMessage('✓ Image loaded');
    } catch {
      setMessage('✗ Failed to load image');
    }
  };

  const handleAddWatermark = async () => {
    if (!sourceImage) {
      setMessage('✗ Please upload an image first');
      return;
    }

    setLoading(true);
    try {
      if (watermarkType === 'visible') {
        const result = await applyVisibleWatermark(sourceImage, {
          text: visibleText,
          position,
          fontSize,
          fontFamily,
          color,
          opacity,
          rotation,
        });
        setWatermarkedImage(result.dataUrl);
        setMessage(`✓ Watermark applied (${result.size}KB)`);
      } else {
        const result = await applyInvisibleWatermark(sourceImage, {
          message: invisibleText,
          strength,
        });
        setWatermarkedImage(result.dataUrl);
        setMessage(`✓ Invisible watermark embedded (${result.size}KB)`);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setMessage(`✗ ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setMessage('✓ Downloaded');
  };

  const handleVerifyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFile(file);
      setVerifyImage(dataUrl);
      setMessage('✓ Image loaded');
      
      // Auto-detect watermark
      const detected = await detectWatermark(dataUrl);
      setWatermarkDetected(detected);
      setMessage(detected ? '✓ Watermark detected' : '? No watermark detected');
    } catch {
      setMessage('✗ Failed to load image');
    }
  };

  const handleExtract = async () => {
    if (!verifyImage) {
      setMessage('✗ Please upload an image');
      return;
    }

    setLoading(true);
    try {
      const result = await extractInvisibleWatermark(verifyImage);
      setExtractedText(result.message);
      setExtracted(true);
      setMessage(`✓ Extracted: "${result.message}" (${Math.round(result.confidence * 100)}% confidence)`);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Extraction failed';
      setMessage(`✗ ${error}`);
      setExtracted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFile(file);
      setTestImage(dataUrl);
      setCroppedImage('');
      setNoisyImage('');
      setCropExtracted('');
      setNoiseExtracted('');
      setMessage('✓ Image loaded');
    } catch {
      setMessage('✗ Failed to load image');
    }
  };

  const handleSimulateCrop = async () => {
    if (!testImage) return;
    setLoading(true);
    try {
      const result = await simulateCropAttack(testImage);
      setCroppedImage(result);
      setMessage('✓ Crop attack simulated (80% retained)');
      
      // Try to extract from cropped
      try {
        const extracted = await extractInvisibleWatermark(result);
        setCropExtracted(extracted.message);
      } catch {
        setCropExtracted('Failed to extract');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error';
      setMessage(`✗ ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateNoise = async () => {
    if (!testImage) return;
    setLoading(true);
    try {
      const result = await simulateNoiseAttack(testImage, 0.15);
      setNoisyImage(result);
      setMessage('✓ Noise attack simulated');

      // Try to extract from noisy
      try {
        const extracted = await extractInvisibleWatermark(result);
        setNoiseExtracted(extracted.message);
      } catch {
        setNoiseExtracted('Failed to extract');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error';
      setMessage(`✗ ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSourceImage('');
    setWatermarkedImage('');
    setVisibleText('© 2026 DataSeal');
    setInvisibleText('Owner:Anonymous');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">DataSeal</h1>
          </div>
          <p className="text-slate-400">Advanced watermarking & image verification platform</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          {(['add', 'verify', 'test'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab === 'add' && '➕ Add Watermark'}
              {tab === 'verify' && '✓ Verify & Extract'}
              {tab === 'test' && '🔬 Test Resilience'}
            </button>
          ))}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg backdrop-blur-sm border ${
            message.startsWith('✓') || message.startsWith('?')
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Content */}
        {activeTab === 'add' && (
          <div className="space-y-6">
            {/* Watermark Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              {(['visible', 'invisible'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setWatermarkType(type)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    watermarkType === type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {type === 'visible' ? (
                    <>
                      <Eye className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-semibold">Visible Watermark</div>
                      <div className="text-sm">Text overlay</div>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-semibold">Invisible Watermark</div>
                      <div className="text-sm">Steganography</div>
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Upload Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Upload Image</h2>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleSourceUpload}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:bg-cyan-600 file:text-white file:border-0 file:rounded cursor-pointer hover:bg-slate-700/70"
              />
            </div>

            {/* Visible Watermark Settings */}
            {watermarkType === 'visible' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Watermark Text</label>
                  <input
                    type="text"
                    value={visibleText}
                    onChange={(e) => setVisibleText(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Enter watermark text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Position</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as VisibleWatermarkOptions['position'])}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option>top-left</option>
                    <option>top-center</option>
                    <option>top-right</option>
                    <option>center-left</option>
                    <option>center</option>
                    <option>center-right</option>
                    <option>bottom-left</option>
                    <option>bottom-center</option>
                    <option>bottom-right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Font Size: {fontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="100"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Opacity: {Math.round(opacity * 100)}%</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option>Arial</option>
                    <option>Verdana</option>
                    <option>Georgia</option>
                    <option>Courier New</option>
                    <option>Comic Sans MS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Rotation: {rotation}°</label>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Invisible Watermark Settings */}
            {watermarkType === 'invisible' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Hidden Message</label>
                  <textarea
                    value={invisibleText}
                    onChange={(e) => setInvisibleText(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 resize-none"
                    rows={3}
                    placeholder="Enter message to embed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Embedding Strength</label>
                  <select
                    value={strength}
                    onChange={(e) => setStrength(e.target.value as any)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="low">Low (Fragile, Imperceptible)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Robust, Slightly Visible)</option>
                  </select>
                </div>

                <div>
                  <div className="text-sm font-medium text-slate-300 mb-2">Capacity Info</div>
                  <div className="text-xs text-slate-400">
                    {sourceImage ? '✓ Image loaded, ready to embed' : '⊘ Load image first'}
                  </div>
                </div>
              </div>
            )}

            {/* Preview Section */}
            {(sourceImage || watermarkedImage) && (
              <div className="grid grid-cols-2 gap-6">
                {sourceImage && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">Original Image</div>
                    <img src={sourceImage} alt="Original" className="w-full rounded-lg max-h-96 object-contain" />
                  </div>
                )}
                {watermarkedImage && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-300 mb-2">Watermarked Image</div>
                    <img src={watermarkedImage} alt="Watermarked" className="w-full rounded-lg max-h-96 object-contain" />
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={reset}
                disabled={loading}
                className="px-6 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleAddWatermark}
                disabled={!sourceImage || loading}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {loading ? 'Processing...' : 'Apply Watermark'}
              </button>
              {watermarkedImage && (
                <button
                  onClick={() => handleDownload(watermarkedImage, `dataseal-${watermarkType}.png`)}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Verify & Extract Watermark</h2>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleVerifyUpload}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:bg-green-600 file:text-white file:border-0 file:rounded cursor-pointer hover:bg-slate-700/70"
              />
            </div>

            {verifyImage && watermarkDetected !== null && (
              <div className={`p-4 rounded-lg backdrop-blur-sm border ${
                watermarkDetected
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                  : 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300'
              }`}>
                {watermarkDetected ? (
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>Watermark detected in image</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>No watermark signature detected</span>
                  </div>
                )}
              </div>
            )}

            {verifyImage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-slate-300 mb-2">Image to Verify</div>
                  <img src={verifyImage} alt="Verify" className="w-full rounded-lg max-h-96 object-contain" />
                </div>
                <div className="space-y-4">
                  <button
                    onClick={handleExtract}
                    disabled={!verifyImage || loading}
                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    {loading ? 'Extracting...' : 'Extract Watermark'}
                  </button>

                  {extracted && extractedText && (
                    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                      <div className="text-sm font-medium text-slate-300 mb-2">Extracted Data</div>
                      <div className="bg-slate-800/50 rounded p-3 text-cyan-300 font-mono text-sm break-all">
                        {extractedText}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(extractedText);
                          setMessage('✓ Copied to clipboard');
                        }}
                        className="mt-2 w-full px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm text-white flex items-center justify-center gap-2 transition-all"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">Test Watermark Resilience</h2>
              </div>
              <p className="text-sm text-slate-400 mb-4">Upload a watermarked image to simulate attacks and test robustness</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleTestUpload}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:bg-yellow-600 file:text-white file:border-0 file:rounded cursor-pointer hover:bg-slate-700/70"
              />
            </div>

            {testImage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Crop Attack */}
                <div className="space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-300 mb-4">Crop Attack (80% Retained)</div>
                    <button
                      onClick={handleSimulateCrop}
                      disabled={!testImage || loading}
                      className="w-full px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Maximize2 className="w-4 h-4" />}
                      Simulate Crop
                    </button>
                    {croppedImage && (
                      <>
                        <img src={croppedImage} alt="Cropped" className="w-full rounded-lg mt-3 max-h-48 object-contain" />
                        {cropExtracted && (
                          <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs text-slate-300">
                            Extraction: {cropExtracted}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Noise Attack */}
                <div className="space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-300 mb-4">Noise Attack (15% Intensity)</div>
                    <button
                      onClick={handleSimulateNoise}
                      disabled={!testImage || loading}
                      className="w-full px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Simulate Noise
                    </button>
                    {noisyImage && (
                      <>
                        <img src={noisyImage} alt="Noisy" className="w-full rounded-lg mt-3 max-h-48 object-contain" />
                        {noiseExtracted && (
                          <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs text-slate-300">
                            Extraction: {noiseExtracted}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
