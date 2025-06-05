import { Avatar, AvatarFallback } from "./ui/avatar"
import { Link } from 'react-router-dom';

function NewNav() {
  return (
    <div className="bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold tracking-tight">CodeSM</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/problems"
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors duration-200"
              >
                Problems
              </Link>
              <button className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors duration-200">
                Compete
              </button>
              <button className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors duration-200">
                Learn
              </button>
              <Avatar className="h-10 w-10 bg-gray-200 flex items-center justify-center rounded-full">
                <AvatarFallback className="text-blue-600 font-semibold">U</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NewNav;