export const metadata = {
  title: "Privacy Policy | SkTechGamer Giveaway",
  description: "Privacy Policy for the SkTechGamer Giveaway."
};

export default function PrivacyPage() {
  return (
    <main className="page">
      <div className="brand">SK<span>TECH</span>GAMER</div>
      <section className="card legal-page">
        <span className="eyebrow">LEGAL</span>
        <h1>Privacy <span>Policy</span></h1>
        <p>Last updated: September 23, 2026</p>

        <h2>Information we collect</h2>
        <p>
          When you enter the giveaway, we receive your Google account email,
          YouTube channel ID, Riot ID, giveaway answer, and your self-declared
          Discord, Instagram, and Facebook participation choices.
        </p>

        <h2>How we use information</h2>
        <p>
          We use this information to verify YouTube subscription, prevent
          duplicate giveaway entries, contact or identify participants when
          needed, and manage the giveaway.
        </p>

        <h2>Google and YouTube</h2>
        <p>
          Google OAuth is used to authenticate your account and request YouTube
          read-only access for subscription verification. We do not receive or
          store your Google password. OAuth tokens are handled server-side.
        </p>

        <h2>Storage and sharing</h2>
        <p>
          Giveaway records are stored in a secured PostgreSQL database hosted
          by Neon. Participant information is not displayed publicly or sold.
          We may disclose information when required by law or to protect the
          giveaway service.
        </p>

        <h2>Retention and contact</h2>
        <p>
          Giveaway records may be retained for administration, fraud prevention,
          and winner communication. For privacy questions or deletion requests,
          contact the giveaway administrator through the contact information
          published with the giveaway.
        </p>
      </section>
    </main>
  );
}
