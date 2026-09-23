import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const count = await prisma.participant.count();
    const limit = Math.max(
      1,
      Number.parseInt(process.env.GIVEAWAY_ENTRY_LIMIT ?? "100", 10) || 100
    );

    return NextResponse.json({
      count,
      limit,
      remaining: Math.max(0, limit - count),
      progress: Math.min(100, Math.round((count / limit) * 100))
    });
  } catch (error) {
    console.error("Giveaway count failed:", error);
    return NextResponse.json(
      { code: "COUNT_UNAVAILABLE", message: "Participant count unavailable." },
      { status: 500 }
    );
  }
}
