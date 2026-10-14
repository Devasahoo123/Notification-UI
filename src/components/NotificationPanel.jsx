import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchHistory, STREAM_URL } from "../api";

export default function NotificationPanel({ showToast }) {
  const location = useLocation();
  const justSent = location.state?.justSent;

  const [items, setItems] = useState([]);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchHistory()
      .then((history) =>
        setItems(
          [...history].reverse().map((content, i) => ({
            id: `h-${i}`,
            content,
            time: null,
            fresh: justSent && i === 0, // highlight the message just sent
          }))
        )
      )
      .catch(() => showToast("Could not load history", "error"));

    const source = new EventSource(STREAM_URL);
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.addEventListener("notification", (e) => {
      const { content } = JSON.parse(e.data);
      setItems((prev) => [
        { id: Date.now() + Math.random(), content, time: new Date(), fresh: true },
        ...prev,
      ]);
      showToast("🔔 New notification received", "info");
    });

    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard", "success");
    } catch {
      showToast("Copy failed", "error");
    }
  };

  const visible = items.filter((i) =>
    i.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card">
      <div className="panel-head">
        <h2>Notifications</h2>
        <span className={`status-pill ${connected ? "on" : "off"}`}>
          <span className="dot" />
          {connected ? "Live" : "Reconnecting..."}
        </span>
      </div>

      <div className="panel-tools">
        <input
          type="text"
          placeholder="🔍 Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="ghost" onClick={() => setItems([])} disabled={items.length === 0}>
          Clear all
        </button>
      </div>

      {visible.length === 0 && (
        <p className="empty">
          {items.length === 0 ? "No notifications yet. Send one! ✨" : "No matches found."}
        </p>
      )}

      <ul className="list">
        {visible.map((item) => (
          <li key={item.id} className={`item ${item.fresh ? "fresh" : ""}`}>
            <div className="item-body">
              {item.time && (
                <span className="item-time">{item.time.toLocaleTimeString()}</span>
              )}
              <div className="item-text">{item.content}</div>
            </div>
            <div className="item-actions">
              <button className="icon-btn small" onClick={() => copy(item.content)} title="Copy">
                📋
              </button>
              <button className="icon-btn small" onClick={() => dismiss(item.id)} title="Dismiss">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}