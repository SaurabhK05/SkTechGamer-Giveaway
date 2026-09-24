"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    subscribed: boolean;
    alreadyRegistered?: boolean;
    subscribeUrl?: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [entrySubmitted, setEntrySubmitted] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
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
    void getSession().then((session) => {
      setSignedInEmail(session?.user?.email ?? null);
    });
    if (!new URLSearchParams(window.location.search).has("verify")) return;

    window.history.replaceState({}, "", "/");
    void checkSubscription();
  }, []);

  async function clearBrowserState() {
    window.localStorage.clear();
    window.sessionStorage.clear();

    if ("caches" in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
    }
  }

  async function logOut() {
    setSigningOut(true);
    await clearBrowserState();
    await signOut({ callbackUrl: "/" });
  }

  async function switchAccount() {
    setSigningOut(true);
    await clearBrowserState();
    await signOut({ redirect: false });
    await signIn("google", {
      callbackUrl: "/?verify=1",
      prompt: "select_account"
    });
  }

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
    <main className="page home-page">
      <header className="topbar">
        <div className="brand">SK<span>TECH</span>GAMER</div>

        <nav className="top-links" aria-label="Social links">
          <a href={process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL ?? "https://www.youtube.com/@SkTechGamer05"} target="_blank" rel="noreferrer">
            YouTube
          </a>
          <a href={process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/your-server"} target="_blank" rel="noreferrer">
            Discord
          </a>
          <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/sktechgamer05/"} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </nav>

        <div className="account-controls">
          {signedInEmail ? (
            <>
              <span className="account-email" title={signedInEmail}>
                <span className="account-icon" aria-hidden="true">◎</span>
                {signedInEmail}
              </span>
              <button className="account-button" onClick={switchAccount} disabled={signingOut}>
                {signingOut ? "Switching..." : "Switch account"}
              </button>
              <button className="account-button danger" onClick={logOut} disabled={signingOut}>
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <button className="account-button" onClick={() => void signIn("google", { callbackUrl: "/?verify=1", prompt: "select_account" })}>
              <span className="account-icon" aria-hidden="true">◎</span>
              Sign in
            </button>
          )}
        </div>
      </header>

      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">SKTECHGAMER OFFICIAL GIVEAWAY</span>
          <h1>LEVEL UP <span>YOUR CHANCES</span></h1>
          <p>
            Join the SkTechGamer community, verify your YouTube subscription, and enter for
            exclusive giveaway rewards. This is your gateway to gaming drops, community wins,
            and creator-exclusive perks.
          </p>

          <div className="cta-row">
            {!entrySubmitted && (
              <button className="primary btn-lg" onClick={verify} disabled={loading}>
                {loading ? "Connecting..." : "🔴 Verify & Enter"}
              </button>
            )}
            <a
              className="secondary-btn"
              href={process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL ?? "https://www.youtube.com/@SkTechGamer05"}
              target="_blank"
              rel="noreferrer"
            >
              Watch on YouTube
            </a>
          </div>

          {entryCount && (
            <div className="entry-count compact">
              <strong>{entryCount.count} / {entryCount.limit}</strong>
              <span>Entries locked in</span>
              <div className="progress-track">
                <div style={{ width: `${entryCount.progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="hero-side">
          <div className="status-card glow">
            <span className="mini-label">LIVE STATUS</span>
            <strong>Giveaway Active</strong>
            <p>Verified members get first access to entry and reward announcements.</p>
          </div>

          <div className="status-card dark">
            <span className="mini-label">CHECKLIST</span>
            <ul>
              <li>Google sign-in</li>
              <li>YouTube subscription check</li>
              <li>Giveaway entry form</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <span className="mini-label">01</span>
          <h3>Verify</h3>
          <p>Use your Google account linked to your YouTube channel and confirm your subscription.</p>
        </article>
        <article className="info-card">
          <span className="mini-label">02</span>
          <h3>Enter</h3>
          <p>Complete the giveaway form and claim your slot in the community competition.</p>
        </article>
        <article className="info-card">
          <span className="mini-label">03</span>
          <h3>Win</h3>
          <p>Stay active in the community and watch for giveaway drops and winner announcements.</p>
        </article>
      </section>

      <section className="card hero inner-card">
        {result?.subscribed && (
          <div className="status ok">
            <div className="icon">✓</div>
            <strong>Subscription Verified!</strong>
            <p>You are subscribed to SkTechGamer.</p>
          </div>
        )}

        {!entrySubmitted && (
          <div className="verify-callout">
            <p>
              Sign in with the Google account you use for YouTube. We will verify that exact
              account&apos;s subscription to SkTechGamer before you can complete the giveaway entry.
            </p>
            <button className="primary" onClick={verify} disabled={loading}>
              {loading ? "Connecting..." : "🔴 Verify YouTube Subscription"}
            </button>
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

            <label className="field">
              <span>Giveaway question</span>
              <textarea
                name="question"
                rows={4}
                placeholder="You can play one valorant agent for the rest of you life. who are you choosing?"
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

    </main>
  );
}
