import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

declare const globalThis: {
  prismaGlobal: PrismaClient
  pgPoolGlobal: Pool
} & typeof global

const pool = globalThis.pgPoolGlobal ?? new Pool({
  connectionString: process.env.DATABASE_URL,
})

if (process.env.NODE_ENV !== "production") {
  globalThis.pgPoolGlobal = pool
}

const adapter = new PrismaPg(pool)
const db = globalThis.prismaGlobal ?? new PrismaClient({ adapter })

export default db

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = db
}
