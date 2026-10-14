"use client";
import { useState, type FormEvent } from "react";
import Link from "@/components/AppLink";
import { useAuth } from "@/components/AuthProvider";
import { submitContact } from "@/lib/auth";
import styles from "./pages/PublicPages.module.css";
export default function ContactForm() {
  const { loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError("");
    setSent(false);
    try {
      const result = await submitContact({
        name: String(data.get("name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        topic: String(data.get("topic") || "other"),
        message: String(data.get("message") || "").trim(),
        website: String(data.get("website") || ""),
      });
      if (!result.received)
        throw new Error(
          "Your message could not be confirmed. Please try again.",
        );
      form.reset();
      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not send your message. Please try again or email support@reerhub.com.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      method="post"
      onSubmit={send}
      className={styles.contactForm}
      aria-label="Contact ReerHub"
      aria-busy={busy}
    >
      <div className={styles.fieldRow}>
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="How should we address you?"
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label>
        What can we help with?
        <select name="topic" required defaultValue="">
          <option value="" disabled>
            Select a topic
          </option>
          <option value="listing">A job listing</option>
          <option value="account">My account or profile</option>
          <option value="billing">Pricing or membership</option>
          <option value="privacy">Privacy or my data</option>
          <option value="feedback">Feedback or a suggestion</option>
          <option value="other">Something else</option>
        </select>
      </label>
      <label>
        Your message
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={7}
          placeholder="Tell us what happened and how we can help. For a listing issue, include its ReerHub link."
        />
      </label>
      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Leave this field empty
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            maxLength={200}
          />
        </label>
      </div>
      <p className={styles.formNote}>
        Please leave out passwords, sign-in links, authentication codes and
        payment-card details. We use your contact information to handle your
        request. <Link href="/privacy">Privacy policy</Link>.
      </p>
      {error && (
        <p role="alert" className={styles.formError}>
          {error}
        </p>
      )}
      {sent && (
        <p role="status" className={styles.formSuccess}>
          Message received. Thank you for reaching out. We’ll review it and
          contact you by email if needed.
        </p>
      )}
      <noscript>
        Please email support@reerhub.com to contact us without JavaScript.
      </noscript>
      <button type="submit" disabled={busy || loading} className="btn-primary">
        {busy ? "Sending…" : "Send message"}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
