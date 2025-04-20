'use client';

import { useState, useEffect } from 'react';
import DailyIframe from '@daily-co/daily-js';

export default function CallPage() {
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  // Create a 5‑min Daily room
  async function createRoom() {
    const resp = await fetch('/api/room', { method: 'POST' });
    const { url } = await resp.json();
    setRoomUrl(url);
  }

  // Record 5 s audio and transcribe
  async function recordAndTranscribe() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.start();
    setTimeout(() => recorder.stop(), 5000);
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
      const buffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioContent: base64 }),
      });
      const { transcription } = await res.json();
      alert('Transcription:\n' + transcription);
    };
  }

  // Mount the Daily iframe
  useEffect(() => {
    if (!roomUrl) return;
    const container = document.getElementById('daily-container');
    if (!container) return;

    // bypass TS issues by treating createFrame as any
    const frame: any = (DailyIframe as any).createFrame({
      parentElement: container,
      showLeaveButton: true,
      iframeStyle: {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        border: '0',
      },
    });

    frame.join({ url: roomUrl });
    return () => void frame.destroy();
  }, [roomUrl]);

  return (
    <div className="relative w-full h-screen">
      <div id="daily-container" className="absolute inset-0"></div>
      <main className="relative z-10 flex flex-col items-center justify-center h-screen gap-4">
        <button
          onClick={createRoom}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Start 5‑min Call
        </button>
        <button
          onClick={recordAndTranscribe}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Record & Transcribe 5 s
        </button>
      </main>
    </div>
  );
}
