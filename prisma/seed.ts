import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = ["Luke", "Sam", "Priya", "Tom"];
  for (const name of users) {
    await prisma.user.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // A couple of sample fixtures so the grading engine can be exercised
  // locally without hitting the real football-data.org API.
  const season = Number(process.env.FOOTBALL_DATA_SEASON ?? 2025);

  await prisma.fixture.upsert({
    where: { externalId: 900001 },
    update: {},
    create: {
      externalId: 900001,
      season,
      gameweek: 1,
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      homeTeamApiId: 57,
      awayTeamApiId: 61,
      kickoff: new Date(),
      status: "FINISHED",
      homeScore: 2,
      awayScore: 1,
    },
  });

  await prisma.fixture.upsert({
    where: { externalId: 900002 },
    update: {},
    create: {
      externalId: 900002,
      season,
      gameweek: 1,
      homeTeam: "Manchester United",
      awayTeam: "Tottenham Hotspur",
      homeTeamApiId: 66,
      awayTeamApiId: 73,
      kickoff: new Date(),
      status: "FINISHED",
      homeScore: 1,
      awayScore: 1,
    },
  });

  console.log(`Seeded ${users.length} users and 2 sample fixtures.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
