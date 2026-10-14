import { Link } from "react-router-dom";
import NotificationPanel from "../components/NotificationPanel";

export default function NotificationsPage({ showToast }) {
  return (
    <div className="page-wide">
      <Link to="/" className="back-link">← Send another notification</Link>
      <NotificationPanel showToast={showToast} />
    </div>
  );
}