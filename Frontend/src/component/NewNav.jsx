import { Avatar, AvatarFallback } from "./ui/avatar"

function NewNav() {
  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header Section */}
      {/* <div className="bg-blue-600 text-white p-2 font-bold border-2 border-blue-600">Section 1</div> */}

      {/* Navigation Bar */}
      <div className="bg-gray-700 p-2 flex items-center justify-between">
        <div className="flex space-x-2">
          <button className="bg-green-600 text-black px-4 py-1 rounded">Home</button>
          <button className="bg-gray-300 text-black px-4 py-1 rounded">Problems</button>
          <button className="bg-gray-300 text-black px-4 py-1 rounded">Compete</button>
          <button className="bg-gray-300 text-black px-4 py-1 rounded">Learn</button>
        </div>
        <div>
          <Avatar className="bg-gray-200 h-8 w-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4">{/* Content would go here */}</div>
    </div>
  )
}

export default NewNav;