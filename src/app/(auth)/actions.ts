"use server"

import { createClient } from "@/utils/supabase/server"
import { getOrCreateProfile } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Synchronize profile on login
  try {
    await getOrCreateProfile()
  } catch (err) {
    console.error("Profile sync failed:", err)
  }

  redirect("/")
}

export async function signup(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If Supabase automatically logs in the user (e.g. email confirmation is off)
  if (data?.session) {
    try {
      await getOrCreateProfile()
    } catch (err) {
      console.error("Profile sync failed:", err)
    }
  }

  // Redirect or notify user to check email
  if (data?.user && !data.session) {
    return { success: true, message: "Signup successful! Please check your email to verify your account." }
  }

  redirect("/")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
