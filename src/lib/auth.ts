import { createClient } from "@/utils/supabase/server"
import db from "@/lib/db"

export async function getSessionUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getOrCreateProfile() {
  const user = await getSessionUser()
  
  if (!user) {
    return null
  }

  // Find user in Prisma database
  let dbUser = await db.user.findUnique({
    where: { id: user.id },
  })

  // If user does not exist in local database, create them
  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Student",
        avatarUrl: user.user_metadata?.avatar_url ?? null,
      },
    })
  }

  return dbUser
}
