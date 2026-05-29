import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { classify } from '../lib/classifier.js';

// Resize a Blob/File so its longest edge is at most maxEdge px and re-encode
// as JPEG. The HF Space's YOLO model runs at 640px internally, so 1024 is
// plenty and shrinks a typical phone photo from ~4 MB to ~200 KB — meaning a
// much faster upload over mobile data.
async function downscale(blob, maxEdge = 1024, quality = 0.78) {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
}

export default function Scan() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const previewUrlRef = useRef(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null); // object URL of the snapped photo

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera not supported on this device.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        setError(err?.message || 'Could not access camera. Use Upload instead.');
      }
    }

    start();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  function showPreview(blob) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(blob);
    previewUrlRef.current = url;
    setPreview(url);
  }

  async function classifyAndGo(blob) {
    const small = await downscale(blob);
    const result = await classify(small);
    // Pass the original photo through so the result screen can show it
    // next to the recommendation. Blobs are structured-cloneable so React
    // Router can carry them in location.state.
    navigate('/scan/result', { state: { result, photoBlob: blob } });
  }

  // Pause briefly so the user actually sees the captured photo before the
  // "Analyzing…" indicator appears on top of it.
  const PHOTO_HOLD_MS = 600;

  async function capture() {
    if (busy) return;
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setError('Camera not ready.');
      return;
    }
    // Snap the current frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const fullBlob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.9));

    // 1) Show the photo and free the camera.
    showPreview(fullBlob);
    stopCamera();

    // 2) Let the user see the photo for a beat.
    await new Promise((r) => setTimeout(r, PHOTO_HOLD_MS));

    // 3) Now show the analyzing indicator and send to the model.
    setBusy(true);
    try {
      await classifyAndGo(fullBlob);
    } catch (err) {
      setError(err?.message || 'Capture failed.');
      setBusy(false);
    }
  }

  async function fromFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    showPreview(file);
    stopCamera();
    await new Promise((r) => setTimeout(r, PHOTO_HOLD_MS));
    setBusy(true);
    try {
      await classifyAndGo(file);
    } catch (err) {
      setError(err?.message || 'Classification failed.');
      setBusy(false);
    }
  }

  return (
    <div className="screen scan dark">
      <header className="scan-header">
        <button type="button" className="icon-btn" onClick={() => navigate(-1)} aria-label="Close">
          <i className="ti ti-x" aria-hidden="true"></i>
        </button>
        <div className="scan-title">AI sorter</div>
        <span className="icon-btn placeholder"></span>
      </header>

      <div className="viewfinder">
        {preview ? (
          <>
            <img src={preview} alt="Captured" className="viewfinder-photo" />
            {busy && (
              <div className="viewfinder-chip" role="status" aria-live="polite">
                <i className="ti ti-loader-2 spin" aria-hidden="true"></i>
                <span>Analyzing…</span>
              </div>
            )}
            <span className="corner tl"></span>
            <span className="corner tr"></span>
            <span className="corner bl"></span>
            <span className="corner br"></span>
          </>
        ) : error ? (
          <div className="viewfinder-error">
            <i className="ti ti-camera-off" aria-hidden="true"></i>
            <p>{error}</p>
            <button className="btn outline pill" onClick={() => fileRef.current?.click()}>Upload a photo</button>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted />
            <span className="corner tl"></span>
            <span className="corner tr"></span>
            <span className="corner bl"></span>
            <span className="corner br"></span>
          </>
        )}
      </div>

      <div className="scan-tip">
        <i className="ti ti-bulb" aria-hidden="true"></i>
        {busy ? 'Sending photo to the model…' : 'Tip: clean items earn +5 bonus XP'}
      </div>

      <div className="scan-actions">
        <button type="button" className="icon-btn lg" onClick={() => fileRef.current?.click()} disabled={busy} aria-label="Upload">
          <i className="ti ti-photo" aria-hidden="true"></i>
        </button>
        <button type="button" className="shutter" onClick={capture} disabled={busy || !!preview} aria-label="Capture">
          {busy ? <i className="ti ti-loader-2 spin" aria-hidden="true"></i> : null}
        </button>
        <span className="icon-btn lg placeholder"></span>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={fromFile} hidden />
    </div>
  );
}
