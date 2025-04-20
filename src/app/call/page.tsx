'use client';
import { useState, useEffect } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';

export default function CallPage() {
  const [call, setCall] = useState<DailyCall | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  // 1. Create a 5‑min Daily room
  async function createRoom() {
    const resp = await fetch('/api/room', { method: 'POST' });
    const { url } = await resp.json();
    setRoomUrl(url);
  }

  // 2. Record 5 s of audio and send to transcript API
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
      const base64 = btoa(
        String.fromCharCode(...new Uint8Array(buffer))
      );
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioContent: base64 }),
      });
      const { transcription } = await res.json();
      alert('Transcription:\n' + transcription);
    };
  }

  // 3. When roomUrl is set, join and mount the Daily iframe
  useEffect(() => {
    if (!roomUrl || call) return;

    const frame = DailyIframe.createFrame({
      iframeStyle: {
        position: 'fixed',
        inset: '0',
        width: '100%',
        height: '100%',
        border: '0',
      },
      showLeaveButton: true,
    });

    frame.join({ url: roomUrl });
    setCall(frame);

    return () => {
      void frame.destroy();
    };
  }, [roomUrl, call]);

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      {!roomUrl && (
        <button
          onClick={createRoom}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Start 5‑min Call
        </button>
      )}
      {roomUrl && (
        <button
          onClick={recordAndTranscribe}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Record & Transcribe 5 s
        </button>
      )}
    </main>
  );
}
