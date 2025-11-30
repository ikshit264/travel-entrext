import { prisma } from "../lib/prisma";

async function main() {
  const trip = await prisma.trip.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      itineraries: {
        include: {
          dayPlans: true
        }
      }
    }
  });

  if (!trip) {
    console.log("No trips found.");
    return;
  }

  const dayPlan = trip.itineraries[0]?.dayPlans[0];

  const fs = require('fs');
  fs.writeFileSync('test_ids.json', JSON.stringify({
    tripId: trip.id,
    userId: trip.userId,
    dayPlanId: dayPlan?.id
  }, null, 2));
  console.log("IDs written to test_ids.json");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
