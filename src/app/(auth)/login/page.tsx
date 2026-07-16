"use client"

import * as React from "react"
import { useActionState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { login } from "../actions"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react"

function LoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  
  const [state, formAction, isPending] = useActionState(login, null)
  const [isGooglePending, startGoogleTransition] = useTransition()

  useEffect(() => {
    if (errorParam) {
      toast.error(errorParam)
    }
  }, [errorParam])

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  const handleGoogleSignIn = () => {
    startGoogleTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error(error.message)
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Absolute Decorative Background Circles */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-primary-container/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-secondary-container/20 blur-3xl" />

      <div className="w-full max-w-md space-y-6">
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-all duration-300 hover:scale-105">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary font-heading">
            Aster
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            A calmer way to learn
          </p>
        </div>

        {/* Card Body */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-large">
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-primary font-heading">Welcome Back</h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Sign in to resume your peaceful study environment.
            </p>
          </div>

          <form action={formAction} className="mt-6 space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-primary tracking-widest font-heading pl-1">Email</Label>
              <div className="relative">
                <Mail className="absolute top-3.5 left-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="pl-10 h-11 border-outline-variant/30 bg-surface-container rounded-full focus-visible:ring-primary/20 focus-visible:border-primary text-xs font-semibold"
                  disabled={isPending || isGooglePending}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-primary tracking-widest font-heading pl-1">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute top-3.5 left-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10 h-11 border-outline-variant/30 bg-surface-container rounded-full focus-visible:ring-primary/20 focus-visible:border-primary text-xs font-semibold"
                  disabled={isPending || isGooglePending}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 mt-4 bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer shadow-sm text-xs active:scale-95"
              disabled={isPending || isGooglePending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20"></div>
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-3 font-semibold text-[11px]">Or continue with</span>
            </div>
          </div>

          {/* Social Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-outline-variant/30 text-foreground hover:bg-surface-container-high rounded-full font-bold cursor-pointer text-xs active:scale-95 transition-all"
            onClick={handleGoogleSignIn}
            disabled={isPending || isGooglePending}
          >
            {isGooglePending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2.5 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
            )}
            Google
          </Button>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground font-semibold">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-secondary hover:underline transition-all"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}
