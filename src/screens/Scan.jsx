import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { classify } from '../lib/classifier.js';

export default function Scan() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

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
    };
  }, []);

  async function capture() {
    if (busy) return;
    setBusy(true);
    try {
      const video = videoRef.current;
      if (!video || !video.videoWidth) throw new Error('Camera not ready.');
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
      const result = await classify(blob);
      navigate('/scan/result', { state: { result } });
    } catch (err) {
      setError(err?.message || 'Capture failed.');
    } finally {
      setBusy(false);
    }
  }

  async function fromFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const result = await classify(file);
      navigate('/scan/result', { state: { result } });
    } catch (err) {
      setError(err?.message || 'Classification failed.');
    } finally {
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
        {error ? (
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
        Tip: clean items earn +5 bonus XP
      </div>

      <div className="scan-actions">
        <button type="button" className="icon-btn lg" onClick={() => fileRef.current?.click()} aria-label="Upload">
          <i className="ti ti-photo" aria-hidden="true"></i>
        </button>
        <button type="button" className="shutter" onClick={capture} disabled={busy} aria-label="Capture">
          {busy ? <i className="ti ti-loader-2 spin" aria-hidden="true"></i> : null}
        </button>
        <span className="icon-btn lg placeholder"></span>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={fromFile} hidden />
    </div>
  );
}
