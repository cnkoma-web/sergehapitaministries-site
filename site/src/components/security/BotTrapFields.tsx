"use client";

import { useEffect, useState } from "react";

/** Signaux discrets complémentaires à Turnstile. */
export default function BotTrapFields() {
  const [startedAt, setStartedAt] = useState("");

  useEffect(() => {
    setStartedAt(String(Date.now()));
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}
    >
      <label htmlFor={`website-${startedAt}`}>Site internet</label>
      <input id={`website-${startedAt}`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      <input name="formStartedAt" type="hidden" value={startedAt} />
    </div>
  );
}
