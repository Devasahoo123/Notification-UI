import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendNotification } from "../api";

const MAX_LEN = 200;

const CHANNELS = [
  { key: "EMAIL", label: "Email", icon: "📧" },
  { key: "SMS", label: "SMS", icon: "💬" },
  { key: "POPUP", label: "Popup", icon: "🖥️" },
];

const TEMPLATES = [
  { label: "📦 Order shipped", text: "Your order has been shipped!" },
  { label: "🔑 Password reset", text: "Click the link to reset your password." },
  { label: "💰 Payment received", text: "We have received your payment. Thank you!" },
  { label: "📅 Reminder", text: "Reminder: your meeting starts in 15 minutes." },
];

const pad = (n) => String(n).padStart(2, "0");
const formatNow = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

export default function NotificationForm({ showToast }) {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [timestamp, setTimestamp] = useState(true);
  const [useSignature, setUseSignature] = useState(false);
  const [signature, setSignature] = useState("Customer Care");
  const [channels, setChannels] = useState({ EMAIL: true, SMS: false, POPUP: true });
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleChannel = (key) =>
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));

  let preview = message || "Your message will appear here...";
  if (timestamp) preview = `[${formatNow(now)}] ${preview}`;
  if (useSignature && signature.trim()) preview += `\n-- ${signature}`;

  const handleSubmit = async () => {
    if (!message.trim()) {
      showToast("Please enter a message", "error");
      return;
    }
    const selected = Object.keys(channels).filter((k) => channels[k]);
    if (selected.length === 0) {
      showToast("Select at least one channel", "error");
      return;
    }
    setLoading(true);
    try {
      const result = await sendNotification({
        message,
        timestamp,
        signature: useSignature ? signature : "",
        channels: selected,
      });
      showToast(result, "success");
      // Go to the next page after a successful send
      navigate("/notifications", { state: { justSent: true } });
    } catch (err) {
      showToast("Failed: " + err.message, "error");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
  };

  return (
    <div className="card">
      <h2>Send Notification</h2>

      <div className="chips">
        {TEMPLATES.map((t) => (
          <button key={t.label} className="chip" onClick={() => setMessage(t.text)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="field">
        <textarea
          rows={4}
          maxLength={MAX_LEN}
          placeholder="Type your message... (Ctrl+Enter to send)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <span className={`counter ${message.length > MAX_LEN - 20 ? "warn" : ""}`}>
          {message.length}/{MAX_LEN}
        </span>
      </div>

      <h3>Decorators</h3>
      <div className="toggles">
        <label className="switch">
          <input
            type="checkbox"
            checked={timestamp}
            onChange={(e) => setTimestamp(e.target.checked)}
          />
          <span className="slider" />
          Timestamp
        </label>

        <label className="switch">
          <input
            type="checkbox"
            checked={useSignature}
            onChange={(e) => setUseSignature(e.target.checked)}
          />
          <span className="slider" />
          Signature
        </label>
      </div>

      {useSignature && (
        <input
          type="text"
          placeholder="Signature, e.g. Customer Care"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
        />
      )}

      <h3>Send via</h3>
      <div className="channels">
        {CHANNELS.map((c) => (
          <button
            key={c.key}
            className={`channel ${channels[c.key] ? "active" : ""}`}
            onClick={() => toggleChannel(c.key)}
          >
            <span className="channel-icon">{c.icon}</span>
            {c.label}
            {channels[c.key] && <span className="tick">✓</span>}
          </button>
        ))}
      </div>

      <h3>Preview</h3>
      <pre className="preview">{preview}</pre>

      <button className="primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Sending..." : "Send Notification 🚀"}
      </button>
    </div>
  );
}