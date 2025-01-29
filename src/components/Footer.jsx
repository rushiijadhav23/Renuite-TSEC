function Footer() {
  return (
    <footer className="bg-[#7E5CAD] text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Missing Persons Tracker</h3>
            <p className="text-gray-300">
              Helping reunite families through technology and community effort.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-300 hover:text-white">About Us</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
              <li><a href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
            <p className="text-gray-300">
              Helpline: 1800-XXX-XXXX<br />
              Email: help@missingpersonstracker.org
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-300">© 2025 Missing Persons Tracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;