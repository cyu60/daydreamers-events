"use client";

import { useState, FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function RegistrationForm({
  eventId,
  spotsRemaining,
  capacity,
}: {
  eventId: string;
  spotsRemaining: number;
  capacity: number;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const isFull = capacity > 0 && spotsRemaining <= 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;

    setState("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, name, email }),
      });

      const data = await res.json();

      if (data.success) {
        setState("success");
        setMessage(data.message);
      } else {
        setState("error");
        setMessage(data.message);
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (isFull) {
    return (
      <div className="w-full py-3.5 rounded-full text-sm font-semibold tracking-wide text-center bg-ink/10 text-dust cursor-not-allowed">
        Event Full
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 py-3.5 rounded-[14px] bg-cobalt-soft text-cobalt text-sm font-semibold tracking-wide">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Registered
        </div>
        <p className="text-xs text-dust text-center">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className="w-full px-4 py-2.5 rounded-[10px] border border-border bg-paper text-ink text-sm placeholder:text-dust/60 focus:outline-none focus:ring-2 focus:ring-cobalt/30 focus:border-cobalt transition-all duration-150"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-[10px] border border-border bg-paper text-ink text-sm placeholder:text-dust/60 focus:outline-none focus:ring-2 focus:ring-cobalt/30 focus:border-cobalt transition-all duration-150"
        />
      </div>

      {state === "error" && message && (
        <p className="text-xs text-red-600 text-center">{message}</p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full py-3.5 rounded-full text-sm font-semibold tracking-wide text-center bg-cobalt text-white hover:bg-cobalt-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {state === "submitting" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Registering...
          </span>
        ) : (
          "Register"
        )}
      </button>
    </form>
  );
}

/** Compact version for mobile bottom bar */
export function RegistrationButton({
  eventId,
  spotsRemaining,
  capacity,
}: {
  eventId: string;
  spotsRemaining: number;
  capacity: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const isFull = capacity > 0 && spotsRemaining <= 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;

    setState("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, name, email }),
      });

      const data = await res.json();

      if (data.success) {
        setState("success");
        setMessage(data.message);
      } else {
        setState("error");
        setMessage(data.message);
      }
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (isFull) {
    return (
      <div className="px-6 py-3 rounded-full text-sm font-semibold tracking-wide bg-ink/10 text-dust cursor-not-allowed">
        Event Full
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-cobalt-soft text-cobalt text-sm font-semibold tracking-wide">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Registered
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-block px-6 py-3 rounded-full text-sm font-semibold tracking-wide bg-cobalt text-white hover:bg-cobalt-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
      >
        Register
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={() => {
          if (state !== "submitting") setShowForm(false);
        }}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-card border border-border rounded-[14px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-display)] text-lg text-ink">
            Register
          </h3>
          <button
            onClick={() => setShowForm(false)}
            className="text-dust hover:text-ink transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="w-full px-4 py-2.5 rounded-[10px] border border-border bg-paper text-ink text-sm placeholder:text-dust/60 focus:outline-none focus:ring-2 focus:ring-cobalt/30 focus:border-cobalt transition-all duration-150"
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-[10px] border border-border bg-paper text-ink text-sm placeholder:text-dust/60 focus:outline-none focus:ring-2 focus:ring-cobalt/30 focus:border-cobalt transition-all duration-150"
          />

          {state === "error" && message && (
            <p className="text-xs text-red-600 text-center">{message}</p>
          )}

          <button
            type="submit"
            disabled={state === "submitting"}
            className="w-full py-3.5 rounded-full text-sm font-semibold tracking-wide text-center bg-cobalt text-white hover:bg-cobalt-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {state === "submitting" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Registering...
              </span>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
