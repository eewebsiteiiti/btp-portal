import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-lg mx-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          BTP Allocation Portal
        </h1>
        <p className="text-gray-600 mb-2">
          EE Department, IIT Indore
        </p>
        <p className="text-gray-500 mb-6 text-sm">
          Manage your Bachelor&apos;s Thesis Project preferences and allocations
        </p>
        <Button asChild className="w-full" size="lg">
          <Link href="/login">Login to Continue</Link>
        </Button>
      </div>
    </div>
  );
}
