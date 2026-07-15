import { NextResponse } from "next/server"
import db from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Attempt a simple database query
    const userCount = await db.user.count()
    return NextResponse.json({
      status: "success",
      message: "Database connection successful!",
      userCount,
      databaseUrlConfigured: !!process.env.DATABASE_URL,
      databaseUrlSnippet: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 35) + "..." : "not_configured"
    })
  } catch (err: any) {
    console.error("DB Test failed:", err)
    return NextResponse.json({
      status: "error",
      message: "Database connection failed!",
      error: err.message || String(err),
      stack: err.stack,
      cause: err.cause,
      databaseUrlConfigured: !!process.env.DATABASE_URL,
      databaseUrlSnippet: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 35) + "..." : "not_configured"
    }, { status: 500 })
  }
}
