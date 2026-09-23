import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
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

  const [total, participants] = await Promise.all([
    prisma.participant.count({ where }),
    prisma.participant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    participants
  });
}
