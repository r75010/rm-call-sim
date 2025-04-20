return () => { void frame.destroy(); };
return () => { void frame.destroy(); };
'use client';
import { useState, useEffect } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';

export default function CallPage() {
  const [call, setCall] = useState<DailyCall | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  async function createRoom() {
    const r = await fetch('/api/room', { method: 'POST' }).then(r => r.json());
    setRoomUrl(r.url);
  }

  // join once we have a room URL
  useEffect(() => {
    if (!roomUrl || call) return;
    const frame = DailyIframe.createFrame({
      iframeStyle: {
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: '0',
      },
      showLeaveButton: true,
    });
    frame.join({ url: roomUrl });
    setCall(frame);

    return () => { void frame.destroy(); };
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
