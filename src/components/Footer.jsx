export function Footer() {
  return (
    <footer className="border-t bg-white text-gray-700 py-6 mt-10">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 text-center md:text-left">
        {/* Texte principal */}
        <p className="text-sm">
          © {new Date().getFullYear()} <span className="font-semibold text-blue-600">MonApp</span>. Tous droits réservés.
        </p>

        {/* Liens rapides */}
        <div className="flex gap-4 mt-3 md:mt-0">
          <a href="/about" className="hover:text-blue-600 text-sm">
            À propos
          </a>
          <a href="/contact" className="hover:text-blue-600 text-sm">
            Contact
          </a>
          <a href="#" className="hover:text-blue-600 text-sm">
            Mentions légales
          </a>
        </div>
      </div>
    </footer>
  )
}
