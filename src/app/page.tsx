import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Users, FolderKanban, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-3xl mx-auto">
          {/* EE Logo */}
          <div className="mt-8 mb-8 flex justify-center">
            <Image
              src="/ee-logo.jpg"
              alt="Electrical Engineering Logo"
              width={150}
              height={150}
              className="h-36 w-36 object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            BTP Allocation Portal
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-blue-200 mb-2">
            Department of Electrical Engineering
          </p>
          <p className="text-lg text-blue-300/80 mb-8">
            Indian Institute of Technology Indore
          </p>

          {/* Description */}
          <p className="text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
            Streamline your Bachelor&apos;s Thesis Project allocation process.
            Submit your preferences now.
          </p>

          {/* CTA Button */}
          <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-slate-900 hover:bg-blue-50 shadow-lg">
            <Link href="/login" className="flex items-center gap-2">
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto px-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-blue-300" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Students</h3>
              <p className="text-sm text-slate-300">
                Browse projects, submit preferences, and track your allocation status
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Users className="h-8 w-8 text-blue-300" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Professors</h3>
              <p className="text-sm text-slate-300">
                Manage projects, review student preferences, and rank candidates
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FolderKanban className="h-8 w-8 text-blue-300" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Administration</h3>
              <p className="text-sm text-slate-300">
                Oversee the allocation process and manage system settings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="bg-white rounded-lg p-1">
            <Image
              src="/iit-indore-logo.jpg"
              alt="IIT Indore Logo"
              width={60}
              height={60}
              className="h-14 w-14 object-contain"
            />
          </div>
          <p className="text-slate-400 text-sm">
            IIT Indore - Department of Electrical Engineering
          </p>
        </div>
      </div>
    </div>
  );
}
