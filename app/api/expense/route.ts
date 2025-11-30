import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createExpenseSchema } from "@/utils/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const validated = createExpenseSchema.parse(body);

    const trip = await prisma.trip.findFirst({
      where: {
        id: validated.tripId,
        userId: user.id,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        tripId: validated.tripId,
        dayPlanId: validated.dayPlanId || null,
        category: validated.category,
        amount: validated.amount,
        currency: validated.currency,
        note: validated.note || null,
      },
    });

    return NextResponse.json({ expense });
  } catch (error: any) {
    console.error("Expense creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create expense" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");

    if (!tripId) {
      return NextResponse.json(
        { error: "Trip ID is required" },
        { status: 400 }
      );
    }

    const expenses = await prisma.expense.findMany({
      where: {
        trip: {
          id: tripId,
          userId: user.id,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    const totalByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return NextResponse.json({
      expenses,
      summary: {
        total,
        byCategory: totalByCategory,
        count: expenses.length,
      },
    });
  } catch (error: any) {
    console.error("Expense fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}
