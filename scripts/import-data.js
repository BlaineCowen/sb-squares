const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function importData() {
  try {
    // Delete all existing data
    await prisma.square.deleteMany();
    await prisma.quarterWinner.deleteMany();
    await prisma.grid.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.gameData.deleteMany();

    // Import Users
    await prisma.user.createMany({
      data: [
        {
          id: "cm6prmtsj0000lopo2vzkvogs",
          name: "Test User",
          email: "test@example.com",
          color: "#FF0000",
        },
        {
          id: "cm6r0z4450000eft9ch4w4303",
          name: "Jesse Gutierrez",
          email: "jessegutierrez13@gmail.com",
          image:
            "https://lh3.googleusercontent.com/a/ACg8ocI63AYpa9Qvj-tJdP8ocxMH84XlwMDHgxzBpcTuiNnd-jmOV18=s96-c",
          color: "#ccfeba",
        },
        {
          id: "cm6yabi1w00006fcbz5p5rola",
          name: "Raghad",
          email: "raghadgaderboh44@gmail.com",
          color: "#1276c1",
          password:
            "$2a$10$bJlLM5SHNkO6NIWDgpRQZeYI8KXDG8EtfizQ4/ceOrOO/z/BqdTDC",
        },
        {
          id: "cm6yacwht0003qn3gsrbuuq7l",
          name: "Nikolai Hood",
          email: "nikolaihood1@gmail.com",
          image:
            "https://lh3.googleusercontent.com/a/ACg8ocKKJZHNJ8PITEje6AVNaCf2v1H96H_tbTXCjrGq7gh-cyabHw=s96-c",
          color: "#2b29f7",
        },
        {
          id: "cm6yacwv800016fcbzl0nce73",
          name: "J",
          email: "jmayhemyeah@gmail.com",
          image:
            "https://lh3.googleusercontent.com/a/ACg8ocKZ4PpNU0ROLFpfaOhE1s8hes56NvTdMWJM0B7SAK7efA5G-w=s96-c",
          color: "#e131ea",
        },
      ],
    });

    // Import Grids
    await prisma.grid.createMany({
      data: [
        {
          id: "cm6prmwx4000013cq4fqdwo6r",
          code: "DCDQ29",
          createdAt: new Date("2025-02-04 00:52:57.255"),
          ownerId: "cm6prmtsj0000lopo2vzkvogs",
          name: "iuhiuhwe",
          payoutFinal: 25,
          payoutQ1: 25,
          payoutQ2: 25,
          payoutQ3: 25,
          squarePrice: 5,
          isLocked: false,
          xScoreArr: "?",
          yScoreArr: "?",
          randomizeQuarters: true,
          isSortedByScores: false,
          randomQ2: false,
          randomQ3: false,
          randomQ4: false,
        },
      ],
    });

    // Import GameData
    await prisma.gameData.createMany({
      data: [
        {
          id: "7da04f6f-3e3b-4bd4-9540-362d55169ed8",
          homeTeam: "Eagles",
          awayTeam: "Chiefs",
          homeLogo:
            "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/phi.png",
          awayLogo:
            "https://a.espncdn.com/i/teamlogos/nfl/500/scoreboard/kc.png",
          homeScore: 0,
          awayScore: 0,
          quarter: 0,
          clock: "0:00",
          status: "pre",
          gameDate: new Date("2025-02-09 23:30:00"),
          createdAt: new Date("2025-02-03 21:13:36"),
          updatedAt: new Date("2025-02-03 21:13:32"),
          gameId: "superbowl2024",
        },
      ],
    });

    // Import Squares
    await prisma.square.createMany({
      data: [
        {
          id: "34718104-c2c5-4c47-920d-aa898a3719c0",
          x: 0,
          y: 0,
          status: "AVAILABLE",
          price: 5,
          gridId: "cm6prmwx4000013cq4fqdwo6r",
          awayScore: "",
          homeScore: "",
        },
        {
          id: "5fab6c05-7d9a-47a7-a982-245f68fedd7d",
          x: 1,
          y: 0,
          status: "AVAILABLE",
          price: 5,
          gridId: "cm6prmwx4000013cq4fqdwo6r",
          awayScore: "",
          homeScore: "",
        },
      ],
    });

    console.log("Data imported successfully!");
  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
