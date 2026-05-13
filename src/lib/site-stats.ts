import { prisma } from "@/lib/prisma";

const SINGLETON_ID = 1;

export async function getSiteStats() {
  let row = await prisma.siteStats.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) {
    row = await prisma.siteStats.create({
      data: {
        id: SINGLETON_ID,
        liveViewers: 220,
        totalListens: 1_840_020,
        listeningNow: 48,
      },
    });
  }
  return row;
}

export async function updateSiteStats(input: {
  liveViewers: number;
  totalListens: number;
  listeningNow: number;
}) {
  return prisma.siteStats.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...input },
    update: input,
  });
}
