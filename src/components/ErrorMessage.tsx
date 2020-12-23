import { useState } from "react";

interface ErrorMessageProps {
  header?: React.ReactNode;
  children: React.ReactNode;
}

export default function ErrorMessage({ header, children }: ErrorMessageProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) {
    return null;
  }

  return (
    <article className="message is-danger">
      <div className="message-header">
        {typeof header === "string" || header === undefined ? (
          <p>{header ?? "Error"}</p>
        ) : (
          header
        )}
        <button
          className="delete"
          aria-label="delete"
          onSubmit={() => setVisible(false)}
        ></button>
      </div>
      <div className="message-body">{children}</div>
    </article>
  );
}
