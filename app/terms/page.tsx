export const metadata = {
  title: "Terms of Service | SkTechGamer Giveaway",
  description: "Terms of Service for the SkTechGamer Giveaway."
};

export default function TermsPage() {
  return (
    <main className="page">
      <div className="brand">SK<span>TECH</span>GAMER</div>
      <section className="card legal-page">
        <span className="eyebrow">LEGAL</span>
        <h1>Terms of <span>Service</span></h1>
        <p>Last updated: September 23, 2026</p>

        <h2>Eligibility</h2>
        <p>
          You must provide accurate information and use your own Google and
          YouTube account. One giveaway entry is allowed per authenticated
          YouTube channel and Riot ID.
        </p>

        <h2>Entry requirements</h2>
        <p>
          Participants must be subscribed to the configured SkTechGamer YouTube
          channel. Discord, Instagram, and Facebook actions are self-declared
          unless a separate verification process is announced.
        </p>

        <h2>Fair participation</h2>
        <p>
          Duplicate, fraudulent, abusive, or automated entries may be rejected.
          The organizer may disqualify entries that violate these terms or the
          rules announced for a specific giveaway.
        </p>

        <h2>Giveaway administration</h2>
        <p>
          Giveaway dates, prizes, winner selection, and announcement details
          will be shared through the official SkTechGamer channels. The
          organizer may modify or cancel a giveaway when reasonably necessary.
        </p>

        <h2>Service use</h2>
        <p>
          This website is provided for giveaway registration and verification.
          By using it, you agree not to interfere with the service, submit
          unlawful content, or impersonate another person.
        </p>
      </section>
    </main>
  );
}
