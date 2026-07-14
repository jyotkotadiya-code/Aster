"use client"

import * as React from "react"
import { useActionState, useEffect } from "react"
import Link from "next/link"
import { signup } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Sparkles, User, Mail, Lock, Loader2 } from "lucide-react"

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    } else if (state?.success && state?.message) {
      toast.success(state.message)
    }
  }, [state])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      {/* Absolute Decorative Background Circles */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

      <div className="w-full max-w-md space-y-6">
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 hover:scale-105">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Aster
          </h1>
          <p className="text-sm text-muted-foreground">
            A calmer way to learn
          </p>
        </div>

        {/* Card Body */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-foreground">Create Account</h2>
            <p className="text-xs text-muted-foreground">
              Sign up to customize your healthy study dashboard.
            </p>
          </div>

          <form action={formAction} className="mt-6 space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="pl-9 h-10 border-border bg-background focus-visible:ring-primary focus-visible:border-primary"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="pl-9 h-10 border-border bg-background focus-visible:ring-primary focus-visible:border-primary"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="•••••••• (6+ characters)"
                  required
                  className="pl-9 h-10 border-border bg-background focus-visible:ring-primary focus-visible:border-primary"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 mt-2 bg-primary text-primary-foreground hover:bg-primary/95 transition-all rounded-md font-medium cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-secondary hover:underline transition-all"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
