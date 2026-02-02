export default function Footer() {
  return (
    <footer className="border-t border-[#223049] pt-8 pb-8 px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

        <div>
          <p className="text-white text-lg font-bold">OrbitDev</p>
          <p className="text-[#90a6cb] text-sm mt-4">
            AI-powered mentorship to help you grow.
          </p>
        </div>

        <div>
          <p className="font-bold text-white mb-4">Product</p>
          <ul className="space-y-2">
            <li><a className="text-[#90a6cb] hover:text-white">Features</a></li>
            <li><a className="text-[#90a6cb] hover:text-white">Pricing</a></li>
            <li><a className="text-[#90a6cb] hover:text-white">Testimonials</a></li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-white mb-4">Company</p>
          <ul className="space-y-2">
            <li><a className="text-[#90a6cb] hover:text-white">About Us</a></li>
            <li><a className="text-[#90a6cb] hover:text-white">Blog</a></li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-white mb-4">Legal</p>
          <ul className="space-y-2">
            <li><a className="text-[#90a6cb] hover:text-white">Privacy Policy</a></li>
            <li><a className="text-[#90a6cb] hover:text-white">Terms of Service</a></li>
          </ul>
        </div>

      </div>

      <div className="mt-8 pt-8 border-t border-[#223049] text-center">
        <p className="text-[#90a6cb] text-sm">
          © 2026 OrbitDev. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
