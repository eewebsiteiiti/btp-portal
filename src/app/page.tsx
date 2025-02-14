
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center" 
      style={{ backgroundImage: "url('/background.jpg')" }}
    >
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-md text-center max-w-lg">
        <h1 className="text-3xl font-bold mb-4">Welcome to Our Platform</h1>
        <p className="text-gray-600 mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque et euismod ligula.
          Morbi mattis pretium eros, ut mollis leo tempus eget.
        </p>
        <form action="/logout" method="post"></form>
        <form action="/login">
          <Button className="w-full" type="submit">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
