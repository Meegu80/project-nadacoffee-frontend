import { Link } from "react-router";

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center px-4">
      <div className="container mx-auto flex justify-between items-center h-full">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <img src="/coffee-favicon.svg" alt="Logo" className="w-6 h-6" />
          Nerda
        </Link>

        {/* GNB */}
        <nav className="hidden md:flex space-x-6">
          <div className="relative group">
            <button className="hover:text-indigo-600 font-medium">BRAND</button>
            <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block">
              <Link to="/brand/about" className="block px-4 py-2 hover:bg-gray-50">About Us</Link>
              <Link to="/brand/process" className="block px-4 py-2 hover:bg-gray-50">Process</Link>
            </div>
          </div>
          <Link to="/menu" className="hover:text-indigo-600 font-medium">MENU</Link>
          <div className="relative group">
            <button className="hover:text-indigo-600 font-medium">NEWS</button>
            <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block">
              <Link to="/news/news" className="block px-4 py-2 hover:bg-gray-50">News</Link>
              <Link to="/news/event" className="block px-4 py-2 hover:bg-gray-50">Event</Link>
            </div>
          </div>
          <div className="relative group">
            <button className="hover:text-indigo-600 font-medium">SUPPORT</button>
            <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block">
              <Link to="/support/notice" className="block px-4 py-2 hover:bg-gray-50">Notice</Link>
              <Link to="/support/contact" className="block px-4 py-2 hover:bg-gray-50">Contact</Link>
              <Link to="/support/location" className="block px-4 py-2 hover:bg-gray-50">Location</Link>
            </div>
          </div>
        </nav>

        {/* Utils */}
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm hover:text-indigo-600">Login</Link>
          <Link to="/cart" className="text-sm hover:text-indigo-600">Cart</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
