import { Loader } from "lucide-react";

interface LoadingProps {
  message?: string;
}

const Loading = ({ message = "Loading..." }: LoadingProps) => {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="flex items-center gap-2">
        <Loader className="animate-spin h-6 w-6 text-blue-600" />
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
