"use client";
import { useEffect, useState } from "react";

export const DebugZone = () => {
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  useEffect(() => {
    const allWithClass = Array.from(
      document.getElementsByClassName("debug-rsc")
    );
    setDebugMessages(allWithClass.map((e) => e.innerHTML));
  }, []);
  return (
    <div>
      {debugMessages.map((msg, i) => (
        <pre key={i} className="debug-message">
          <code>{msg}</code>
        </pre>
      ))}
    </div>
  );
};
