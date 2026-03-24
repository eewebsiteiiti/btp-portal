"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, GraduationCap, Users, Shield, ArrowLeft, Eye, EyeOff, BookOpen, UserCog } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type Program = "BTP" | "MTP";
type Role = "student" | "professor" | "admin" | "mtp_student" | "dpgc" | "program_coordinator";

const btpRoles: { role: Role; icon: React.ReactNode; label: string; description: string }[] = [
  {
    role: "student",
    icon: <GraduationCap className="h-5 w-5" />,
    label: "Student",
    description: "Submit project preferences",
  },
  {
    role: "professor",
    icon: <Users className="h-5 w-5" />,
    label: "Professor",
    description: "Manage projects & students",
  },
  {
    role: "admin",
    icon: <Shield className="h-5 w-5" />,
    label: "Admin (DUGC)",
    description: "System administration",
  },
];

const mtpRoles: { role: Role; icon: React.ReactNode; label: string; description: string }[] = [
  {
    role: "mtp_student",
    icon: <GraduationCap className="h-5 w-5" />,
    label: "Student",
    description: "Submit project preferences",
  },
  {
    role: "professor",
    icon: <Users className="h-5 w-5" />,
    label: "Professor",
    description: "Manage projects & students",
  },
  {
    role: "program_coordinator",
    icon: <UserCog className="h-5 w-5" />,
    label: "Program Coordinator",
    description: "Domain administration",
  },
  {
    role: "dpgc",
    icon: <Shield className="h-5 w-5" />,
    label: "DPGC",
    description: "MTP administration",
  },
];

function LoginContent() {
  const searchParams = useSearchParams();
  const programParam = searchParams.get("program")?.toUpperCase();
  const initialProgram = (programParam === "BTP" || programParam === "MTP") ? programParam as Program : null;

  const [program, setProgram] = useState<Program | null>(initialProgram);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.role) {
      const roleRedirects: Record<string, string> = {
        admin: "/admin",
        professor: "/professor",
        student: "/student",
        mtp_student: "/mtp-student",
        dpgc: "/dpgc",
        program_coordinator: "/program-coordinator",
      };
      router.push(roleRedirects[session.user.role] || "/");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      role,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid credentials. Please check your email and password.");
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (role) {
      setRole(null);
      setEmail("");
      setPassword("");
      setError("");
    } else if (program) {
      // If program was set from URL, go back to homepage
      if (initialProgram) {
        router.push("/");
      } else {
        setProgram(null);
        setRole(null);
      }
    }
  };

  const roles = program === "BTP" ? btpRoles : program === "MTP" ? mtpRoles : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        {!program && !initialProgram ? (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        ) : (
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-blue-100 rounded-xl">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              {!program
                ? "Select your program to continue"
                : !role
                  ? `Sign in to the ${program === "BTP" ? "B.Tech" : "M.Tech"} Project Allocation Portal`
                  : `Sign in as ${roles.find((r) => r.role === role)?.label}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Program Selection */}
            {!program && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select your program</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setProgram("BTP")}
                    className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-700"
                  >
                    <BookOpen className="h-8 w-8 mb-2 text-gray-400" />
                    <span className="text-lg font-semibold">BTP</span>
                    <span className="text-xs text-muted-foreground mt-1">B.Tech Project</span>
                  </button>
                  <button
                    onClick={() => setProgram("MTP")}
                    className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-700"
                  >
                    <BookOpen className="h-8 w-8 mb-2 text-gray-400" />
                    <span className="text-lg font-semibold">MTP</span>
                    <span className="text-xs text-muted-foreground mt-1">M.Tech Project</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {program && !role && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select your role</Label>
                <div className={`grid gap-2 ${roles.length <= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setRole(r.role)}
                      className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-700"
                    >
                      <div className="mb-1 text-gray-400">{r.icon}</div>
                      <span className="text-sm font-medium text-center">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Credentials Form */}
            {program && role && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-11"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          IIT Indore - Department of Electrical Engineering
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
