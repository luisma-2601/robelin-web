import { NextResponse } from "next/server";
import { getBcvRate } from "@/lib/bcv";

export async function GET() {
  try {
    const rate = await getBcvRate();
    
    return NextResponse.json(
      {
        bcvRate: rate,
        lastUpdated: new Date().toISOString()
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
        }
      }
    );
  } catch (error) {
    console.error("Error fetching BCV rate for public API:", error);
    return NextResponse.json({ error: "Failed to fetch BCV rate" }, { status: 500 });
  }
}
