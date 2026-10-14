export default function ToastContainer({ toasts, onClose }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => onClose(t.id)}>
          <span>{t.text}</span>
          <button className="toast-x">×</button>
        </div>
      ))}
    </div>
  );
}