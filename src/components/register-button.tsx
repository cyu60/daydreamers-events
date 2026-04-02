"use client";

import { useState } from "react";

interface RegisterButtonProps {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  isFull: boolean;
  className?: string;
}

export function RegisterButton({
  eventId,
  eventTitle,
  eventSlug,
  isFull,
  className = "",
}: RegisterButtonProps) {
  const [state, setState] = useState<
    "idle" | "form" | "submitting" | "success" | "error"
  >("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (isFull) {
    return (
      <div
        className={`py-3.5 rounded-full text-sm font-semibold tracking-wide text-center bg-ink/10 text-dust cursor-not-allowed ${className}`}
      >
        Event Full
      </div>
    );
  }

  if (state === "success") {
    return (
      <div
        className={`py-3.5 rounded-full text-sm font-semibold tracking-wide text-center bg-emerald-100 text-emerald-700 ${className}`}
      >
        You're registered!
      </div>
    );
  }

  if (state === "idle") {
    return (
      <button
        onClick={() => setState("form")}
        className={`py-3.5 rounded-full text-sm font-semibold tracking-wide text-center bg-cobalt text-white hover:bg-cobalt-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer ${className}`}
      >
        Register
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          eventId,
          eventTitle,
          eventSlug,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong");
        setState("error");
        return;
      }

      setState("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
        className="w-full px-4 py-3 rounded-xl border border-border bg-paper text-ink text-sm placeholder:text-dust/60 outline-none focus:border-cobalt focus:ring-1 focus:ring-cobalt/30 transition-colors"
      />
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-xl border border-border bg-paper text-ink text-sm placeholder:text-dust/60 outline-none focus:border-cobalt focus:ring-1 focus:ring-cobalt/30 transition-colors"
      />
      {(state === "error") && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setState("idle");
            setErrorMsg("");
          }}
          className="flex-1 py-3 rounded-full text-sm font-medium text-dust border border-border hover:bg-paper transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="flex-1 py-3 rounded-full text-sm font-semibold tracking-wide bg-cobalt text-white hover:bg-cobalt-hover disabled:opacity-60 disabled:cursor-wait transition-colors cursor-pointer"
        >
          {state === "submitting" ? "Registering..." : "Confirm"}
        </button>
      </div>
    </form>
  );
}
