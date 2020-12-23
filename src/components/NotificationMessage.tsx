import { useState } from "react";

interface NotificationMessageProps {
  children: React.ReactNode;
}

export default function NotificationMessageProps({
  children,
}: NotificationMessageProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) {
    return null;
  }
  return (
    <div className="notification is-success">
      <button className="delete" onClick={() => setVisible(false)}></button>
      {children}
    </div>
  );
}
