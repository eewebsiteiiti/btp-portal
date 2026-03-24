import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
            Project Allocation Portal
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
            Streamline your project allocation process. Select your program to get started.
          </p>

          {/* Program Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
            <Link href="/login?program=BTP">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer group h-full">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                      <BookOpen className="h-10 w-10 text-blue-300" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">BTP</h2>
                  <p className="text-blue-200 text-sm mb-4">
                    Bachelor&apos;s Thesis Project
                  </p>
                  <div className="flex items-center justify-center gap-2 text-blue-300 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">Get Started</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/login?program=MTP">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer group h-full">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                      <BookOpen className="h-10 w-10 text-blue-300" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">MTP</h2>
                  <p className="text-blue-200 text-sm mb-4">
                    Master&apos;s Thesis Project
                  </p>
                  <div className="flex items-center justify-center gap-2 text-blue-300 group-hover:text-white transition-colors">
                    <span className="text-sm font-medium">Get Started</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 mb-8 flex flex-col items-center gap-2">
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
