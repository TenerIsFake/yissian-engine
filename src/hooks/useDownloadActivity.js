import { useState, useEffect } from 'react';

const DOWNLOAD_POLL_MS = 20_000;

export default function useDownloadActivity() {
  const [qbTorrents, setQbTorrents] = useState([]);
  const [sabnzbdQueue, setSabnzbdQueue] = useState({ slots: [], speed: '0', timeleft: '0:00:00' });

  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const [qbRes, sabRes] = await Promise.allSettled([
          fetch('/api/qbittorrent/api/v2/torrents/info?filter=active'),
          fetch('/api/sabnzbd/api/?mode=queue&output=json&limit=10'),
        ]);
        if (qbRes.status === 'fulfilled' && qbRes.value.ok) {
          const data = await qbRes.value.json();
          setQbTorrents(Array.isArray(data) ? data : []);
        }
        if (sabRes.status === 'fulfilled' && sabRes.value.ok) {
          const data = await sabRes.value.json();
          setSabnzbdQueue({
            slots: data?.queue?.slots ?? [],
            speed: data?.queue?.speed ?? '0',
            timeleft: data?.queue?.timeleft ?? '0:00:00',
          });
        }
      } catch { /* best-effort */ }
    };
    poll();
    const id = setInterval(poll, DOWNLOAD_POLL_MS);
    return () => clearInterval(id);
  }, []);

  return { qbTorrents, sabnzbdQueue };
}
