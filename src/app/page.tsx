import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-md text-center max-w-lg z-10">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to the BTP Allocation Portal
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to the EE department BTP allocation portal - Spring 2025.
          Please login to continue.
        </p>
        <form action="/logout" method="post"></form>
        <form action="/login">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
            type="submit"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
