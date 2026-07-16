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
            <h2 className="text-base font-bold text-primary font-heading">Create Account</h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Sign up to customize your healthy study dashboard.
            </p>
          </div>

          <form action={formAction} className="mt-6 space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-primary tracking-widest font-heading pl-1">Full Name</Label>
              <div className="relative">
                <User className="absolute top-3.5 left-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="pl-10 h-11 border-outline-variant/30 bg-surface-container rounded-full focus-visible:ring-primary/20 focus-visible:border-primary text-xs font-semibold"
                  disabled={isPending}
                />
              </div>
            </div>

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
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-primary tracking-widest font-heading pl-1">Password</Label>
              <div className="relative">
                <Lock className="absolute top-3.5 left-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="•••••••• (6+ characters)"
                  required
                  className="pl-10 h-11 border-outline-variant/30 bg-surface-container rounded-full focus-visible:ring-primary/20 focus-visible:border-primary text-xs font-semibold"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 mt-4 bg-primary text-primary-foreground hover:opacity-90 transition-all rounded-full font-bold cursor-pointer shadow-sm text-xs active:scale-95"
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
        <p className="text-center text-xs text-muted-foreground font-semibold">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-secondary hover:underline transition-all"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
