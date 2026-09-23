"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getSession, signIn } from "next-auth/react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    subscribed: boolean;
    alreadyRegistered?: boolean;
    subscribeUrl?: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [entrySubmitted, setEntrySubmitted] = useState(false);
  const [entryCount, setEntryCount] = useState<{
    count: number;
    limit: number;
    progress: number;
  } | null>(null);

  async function loadEntryCount() {
    try {
      const response = await fetch("/api/giveaway/count");
      if (!response.ok) return;
      setEntryCount(await response.json());
    } catch {
      // The count is informational and should not block the entry flow.
    }
  }

  async function checkSubscription() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/youtube/verify");
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "YouTube verification failed.");
      }

      setResult(data);
    } catch (verificationError: unknown) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "YouTube verification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEntryCount();
    if (!new URLSearchParams(window.location.search).has("verify")) return;

    window.history.replaceState({}, "", "/");
    void checkSubscription();
  }, []);

  async function verify() {
    setLoading(true);
    setResult(null);
    setError(null);

    const session = await getSession();

    if (session) {
      await checkSubscription();
      return;
    }

    await signIn("google", {
      callbackUrl: "/?verify=1"
    });
  }

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/giveaway/entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        riotId: formData.get("riotId"),
        discordJoined: formData.get("discord") === "on",
        instagramFollowed: formData.get("instagram") === "on",
        facebookFollowed: formData.get("facebook") === "on",
        giveawayAnswer: formData.get("question")
      })
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      if (data.code === "ALREADY_REGISTERED") {
        setResult((currentResult) =>
          currentResult ? { ...currentResult, alreadyRegistered: true } : currentResult
        );
        setError(null);
        setLoading(false);
        return;
      }
      setError(data.message ?? "We could not save your entry.");
      setLoading(false);
      return;
    }

    setEntrySubmitted(true);
    await loadEntryCount();
    setLoading(false);
  }

  return (
    <main className="page">
      <div className="brand">SK<span>TECH</span>GAMER</div>

      <section className="card hero">
        <span className="eyebrow">NIGHT MARKET GIVEAWAY</span>
        <h1>Verify <span>YouTube</span></h1>
        {entryCount && (
          <div className="entry-count">
            <strong>{entryCount.count} / {entryCount.limit}</strong>
            <span>Participants registered</span>
            <div className="progress-track">
              <div style={{ width: `${entryCount.progress}%` }} />
            </div>
          </div>
        )}
        <p>
          Sign in with the Google account you use for YouTube.
          We will verify that exact account&apos;s subscription to SkTechGamer.
        </p>

        {!entrySubmitted && (
          <button className="primary" onClick={verify} disabled={loading}>
            {loading ? "Connecting..." : "🔴 Verify YouTube Subscription"}
          </button>
        )}

        {result?.subscribed && (
          <div className="status ok">
            <div className="icon">✓</div>
            <strong>Subscription Verified!</strong>
            <p>You are subscribed to SkTechGamer.</p>
          </div>
        )}

        {result?.subscribed && !result.alreadyRegistered && !entrySubmitted && (
          <form className="entry-form" onSubmit={submitEntry}>
            <div className="step">STEP 2 <span>• GIVEAWAY ENTRY</span></div>
            <h2>Complete your entry</h2>
            <p>Finish these quick steps to become eligible for the giveaway.</p>

            <label className="field">
              <span>Riot ID</span>
              <input
                name="riotId"
                type="text"
                placeholder="YourName#TAG"
                required
              />
            </label>

            <label className="check-row">
              <input name="discord" type="checkbox" required />
              <span>I have joined the SkTechGamer Discord server</span>
            </label>
            <a className="social-link" href={process.env.NEXT_PUBLIC_DISCORD_URL} target="_blank" rel="noreferrer">
              Join Discord
            </a>

            <label className="check-row">
              <input name="instagram" type="checkbox" required />
              <span>I follow SkTechGamer on Instagram</span>
            </label>
            <a className="social-link" href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} target="_blank" rel="noreferrer">
              Follow Instagram
            </a>

            <label className="check-row">
              <input name="facebook" type="checkbox" required />
              <span>I follow SkTechGamer on Facebook</span>
            </label>
            <a className="social-link" href={process.env.NEXT_PUBLIC_FACEBOOK_URL} target="_blank" rel="noreferrer">
              Follow Facebook
            </a>

            <label className="field">
              <span>Giveaway question</span>
              <textarea
                name="question"
                rows={4}
                placeholder="What should SkTechGamer play next, and why?"
                required
              />
            </label>

            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Giveaway Entry"}
            </button>

            <p className="social-note">
              Join Discord for live giveaway announcements and stream entries.
              Follow Instagram for funny content, great gameplay, and funny reels.
            </p>
          </form>
        )}

        {entrySubmitted && (
          <div className="status ok entry-success">
            <div className="icon">✓</div>
            <strong>You are eligible for the giveaway!</strong>
            <p>Your entry has been completed successfully. Good luck!</p>
          </div>
        )}

        {result?.alreadyRegistered && !entrySubmitted && (
          <div className="status ok entry-success">
            <div className="icon">✓</div>
            <strong>You already registered for this giveaway.</strong>
            <p>Your entry is already recorded. You do not need to submit it again.</p>
          </div>
        )}

        {result && !result.subscribed && (
          <div className="status bad">
            <div className="icon">✕</div>
            <strong>Subscription Not Verified</strong>
            <p>This Google/YouTube account is not subscribed to SkTechGamer.</p>
            <a
              className="primary link"
              href={result.subscribeUrl}
              target="_blank"
              rel="noreferrer"
            >
              🔴 Subscribe to SkTechGamer
            </a>
            <button className="secondary" onClick={checkSubscription}>
              🔄 Verify Again
            </button>
          </div>
        )}

        {error && <div className="status bad">{error}</div>}
      </section>

      <p className="privacy">
        Your Google OAuth access token is handled server-side. It is never
        placed in frontend JavaScript.
      </p>
    </main>
  );
}
