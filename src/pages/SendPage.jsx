import NotificationForm from "../components/NotificationForm";

export default function SendPage({ showToast }) {
  return (
    <div className="page-narrow">
      <NotificationForm showToast={showToast} />
    </div>
  );
}