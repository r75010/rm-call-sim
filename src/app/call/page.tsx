'use client';
import { useState, useEffect } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';

export default function CallPage() {
  const [call, setCall] = useState<DailyCall | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  async function createRoom() {
    const resp = await fetch('/api/room', { method: 'POST' });
    const data = await resp.json();
    setRoomUrl(data.url);
  }

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

    // cleanup
    return () => {
      void frame.destroy(); // ensures the effect returns void, not a Promise
    };
  }, [roomUrl, call]);

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      {!roomUrl && (
        <button
          onClick={createRoom}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Start 5‑min Call
        </button>
      )}
    </main>
  );
}
