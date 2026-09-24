import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function clearParticipants() {
  "use server";

  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  await prisma.participant.deleteMany();
  revalidatePath("/admin");
  redirect("/admin");
}

async function deleteParticipant(formData: FormData) {
  "use server";

  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  const participantId = formData.get("participantId");
  if (typeof participantId !== "string" || !participantId) {
    throw new Error("Invalid participant ID");
  }

  await prisma.participant.delete({ where: { id: participantId } });
  revalidatePath("/admin");
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();

  if (!isAdminEmail(session?.user?.email)) {
    redirect("/");
  }

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 25;
  const where = query
    ? {
        OR: [
          { riotId: { contains: query, mode: "insensitive" as const } },
          { googleEmail: { contains: query, mode: "insensitive" as const } },
          { youtubeChannelId: { contains: query, mode: "insensitive" as const } }
        ]
      }
    : undefined;

  const [total, filteredTotal, participants] = await Promise.all([
    prisma.participant.count(),
    prisma.participant.count({ where }),
    prisma.participant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);
  const limit = Math.max(
    1,
    Number.parseInt(process.env.GIVEAWAY_ENTRY_LIMIT ?? "100", 10) || 100
  );
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));
  const progress = Math.min(100, Math.round((total / limit) * 100));

  return (
    <main className="page">
      <div className="brand">SK<span>TECH</span>GAMER</div>
      <section className="card">
        <span className="eyebrow">ADMIN</span>
        <h1>Giveaway <span>Panel</span></h1>

        <div className="admin-stats">
          <div><strong>{total}</strong><span>Total Participants</span></div>
          <div><strong>{limit}</strong><span>Target</span></div>
          <div><strong>{Math.max(0, limit - total)}</strong><span>Remaining</span></div>
          <div><strong>{progress}%</strong><span>Progress</span></div>
        </div>

        <form className="admin-search" method="get">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search Riot ID, email, or channel ID"
          />
          <button className="secondary" type="submit">Search</button>
        </form>

        <div className="admin-results-bar">
          <span>
            {query ? `${filteredTotal} matching participants` : `${total} participants`}
          </span>
          <span>Page {Math.min(page, totalPages)} of {totalPages}</span>
        </div>

        <form action={clearParticipants} className="admin-clear-form">
          <button className="secondary danger" type="submit">
            Clear database
          </button>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Riot ID</th>
                <th>Google Email</th>
                <th>YouTube Channel</th>
                <th>Social</th>
                <th>Answer</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.id}>
                  <td>{participant.riotId}</td>
                  <td>{participant.googleEmail}</td>
                  <td>{participant.youtubeChannelId}</td>
                  <td>
                    D {participant.discordJoined ? "Yes" : "No"}<br />
                    I {participant.instagramFollowed ? "Yes" : "No"}<br />
                    F {participant.facebookFollowed ? "Yes" : "No"}
                  </td>
                  <td>{participant.giveawayAnswer}</td>
                  <td>{participant.createdAt.toLocaleString()}</td>
                  <td>
                    <form action={deleteParticipant}>
                      <input type="hidden" name="participantId" value={participant.id} />
                      <button className="secondary danger admin-delete" type="submit">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {participants.length === 0 && <p className="empty">No participants found.</p>}
        </div>

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Participant pages">
            {page > 1 ? (
              <a href={`/admin?${new URLSearchParams({ ...(query ? { q: query } : {}), page: String(page - 1) })}`}>
                Previous
              </a>
            ) : <span className="disabled">Previous</span>}
            {page < totalPages ? (
              <a href={`/admin?${new URLSearchParams({ ...(query ? { q: query } : {}), page: String(page + 1) })}`}>
                Next
              </a>
            ) : <span className="disabled">Next</span>}
          </nav>
        )}
      </section>
    </main>
  );
}
