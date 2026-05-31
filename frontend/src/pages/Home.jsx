import { Link } from "react-router-dom";
import ToolCard from "../components/ToolCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}

      <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/50">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <img
              src="/logo.png"
              alt="maygamstools"
              className="h-12"
            />

            <h1 className="text-xl font-bold">
              maygamstools
            </h1>

          </div>

          <a
            href="#tools"
            className="bg-white text-black px-5 py-2 rounded-full font-semibold"
          >
            Explore Tools
          </a>

        </div>

      </nav>

      {/* Hero */}

      <section className="relative px-6 py-28">

        <div className="absolute inset-0 flex justify-center">

          <div className="w-[500px] h-[500px] bg-purple-500/20 blur-[150px] rounded-full"></div>

        </div>

        <div className="relative max-w-5xl mx-auto text-center">

          <h1 className="text-5xl md:text-7xl font-black leading-tight">

            One Platform

            <span className="block bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">

             Unlimited Tools

            </span>

          </h1>

          <p className="text-gray-400 text-lg mt-8 max-w-2xl mx-auto">

            Convert files, optimize images, generate QR codes
            and access powerful online tools — all from one platform.

          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">

            <a
              href="#tools"
              className="bg-white text-black px-8 py-4 rounded-full font-bold"
            >
              Explore Tools
            </a>

            

          </div>

        </div>

      </section>

      {/* Tools */}

      <section
        id="tools"
        className="max-w-7xl mx-auto px-6 py-20"
      >

        <h2 className="text-4xl font-bold text-center mb-14">
          Featured Tools
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          <ToolCard
            title="Image to PDF"
            description="Convert JPG, PNG and images into PDF files."
            path="/tools/image-to-pdf"
          />

          <ToolCard
            title="PDF to Image"
            description="Convert PDF pages into JPG or PNG images."
            path="/tools/pdf-to-image"
          />

          <ToolCard
            title="Image Compressor"
            description="Reduce image size without losing quality."
            path="#"
            status="Coming Soon"
          />

          <ToolCard
            title="QR Generator"
            description="Create QR codes instantly."
            path="#"
            status="Coming Soon"
          />

        </div>

      </section>

     

      {/* Roadmap */}

     <section className="max-w-5xl mx-auto px-6 py-20">

    <h2 className="text-4xl font-bold text-center mb-14">
        Frequently Asked Questions
    </h2>

    <div className="space-y-6">

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

        <h3 className="text-xl font-bold mb-3">
            Is maygamstools free?
        </h3>

        <p className="text-gray-400">
            Yes. All currently available tools are completely free.
        </p>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

        <h3 className="text-xl font-bold mb-3">
            Are my files secure?
        </h3>

        <p className="text-gray-400">
            Uploaded files are processed securely and are not permanently stored.
        </p>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

        <h3 className="text-xl font-bold mb-3">
            What tools are available?
        </h3>

        <p className="text-gray-400">
            Currently Image to PDF and PDF to Image tools are available, with more tools being added over time.
        </p>

        </div>

    </div>

    </section>

      {/* Footer */}

      <footer className="border-t border-white/10 py-10 text-center text-gray-400">

        <img
          src="/logo.png"
          alt="maygamstools"
          className="h-14 mx-auto mb-4"
        />

        <p>
          All your digital tools in one place.
        </p>

        <p className="mt-4">
          © 2026 maygamstools
        </p>

      </footer>

    </div>
  );
}