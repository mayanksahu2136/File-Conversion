import { useState } from "react";

import {
  FaFilePdf,
  FaImage,
  FaBolt,
  FaGithub,
} from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

export default function App() {

  const [mode, setMode] = useState("img-to-pdf");

  const [selectedFile, setSelectedFile] = useState(null);

  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  const [imageFormat, setImageFormat] = useState("png");

  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (file) {

      setSelectedFile(file);

      if (file.type.startsWith("image")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    }
  };

  const handleConvert = async () => {

    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("file", selectedFile);

      formData.append("format", imageFormat);

      const endpoint =
        mode === "img-to-pdf"
          ? "img-to-pdf"
          : "pdf-to-img";

      const response = await fetch(
        `https://file-conversion-backend-3vbm.onrender.com/${endpoint}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      const originalName = selectedFile.name.split(".")[0];
      if (mode === "img-to-pdf") {
        a.download = `${originalName}.pdf`;
      } else {
        a.download = `${originalName}.${imageFormat}`;
      }

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error(error);

      toast.error("Conversion failed")

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white overflow-hidden">

      {/* Navbar */}

      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-lg sticky top-0 bg-black/40 z-50">

        <h1 className="text-3xl font-bold tracking-wide lowercase">
          maygamstools
        </h1>

        <a
          href="#converter"
          className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
        >
          Try Now
        </a>

      </nav>

      {/* Hero Section */}

      <motion.section className="relative flex flex-col items-center justify-center text-center px-6 py-28">

        <div className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl top-10"></div>

        <h1 className="text-6xl md:text-7xl font-black leading-tight max-w-5xl relative z-10">

          Convert Files <br />

          <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">

            Instantly

          </span>

        </h1>

        <p className="text-gray-400 mt-8 max-w-2xl text-lg relative z-10">

          Fast, secure and modern online file conversion tools
          for PDFs and images.

        </p>

        <a
          href="#converter"
          className="mt-10 bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:scale-110 transition relative z-10"
        >
          Start Converting
        </a>

      </motion.section>

      {/* Features Section */}

      <motion.section className="grid md:grid-cols-3 gap-8 px-8 py-16 max-w-7xl mx-auto">

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:scale-105 transition">

          <FaBolt className="text-5xl mb-6 text-yellow-400" />

          <h2 className="text-2xl font-bold mb-4">
            Fast Conversion
          </h2>

          <p className="text-gray-400">
            Convert your files within seconds using powerful backend processing.
          </p>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:scale-105 transition">

          <FaFilePdf className="text-5xl mb-6 text-red-400" />

          <h2 className="text-2xl font-bold mb-4">
            PDF Tools
          </h2>

          <p className="text-gray-400">
            Easily convert PDF files into images and images into PDFs.
          </p>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:scale-105 transition">

          <FaImage className="text-5xl mb-6 text-blue-400" />

          <h2 className="text-2xl font-bold mb-4">
            Multiple Formats
          </h2>

          <p className="text-gray-400">
            Supports PNG, JPG, JPEG and PDF formats.
          </p>

        </div>

      </motion.section>

      {/* Converter Section */}

      <motion.section
        id="converter"
        className="px-6 py-20"
      >

        <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-10 shadow-2xl">

          <h2 className="text-4xl font-bold text-center mb-10">
            File Converter
          </h2>

          {/* Buttons */}

          <div className="flex gap-4 mb-8">

            <button
              onClick={() => {
                setMode("img-to-pdf");
                setSelectedFile(null);
                setPreview(null);
              }}
              className={`flex-1 py-4 rounded-2xl font-bold transition ${
                mode === "img-to-pdf"
                  ? "bg-white text-black"
                  : "bg-white/10"
              }`}
            >
              Image → PDF
            </button>

            <button
              onClick={() => {
                setMode("pdf-to-img");
                setSelectedFile(null);
                setPreview(null);
              }}
              className={`flex-1 py-4 rounded-2xl font-bold transition ${
                mode === "pdf-to-img"
                  ? "bg-white text-black"
                  : "bg-white/10"
              }`}
            >
              PDF → Image
            </button>

          </div>

          {/* Format Select */}

          {
            mode === "pdf-to-img" && (

              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                className="w-full mb-6 p-4 rounded-2xl bg-black border border-white/10"
              >

                <option value="png">PNG</option>

                <option value="jpg">JPG</option>

                <option value="jpeg">JPEG</option>

              </select>

            )
          }

          {/* Upload Area */}

          <label
            htmlFor="fileUpload"
            className="border-2 border-dashed border-white/20 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
          >

            <input
              type="file"
              id="fileUpload"
              className="hidden"
              accept={
                mode === "img-to-pdf"
                  ? "image/*"
                  : ".pdf"
              }
              onChange={handleFileChange}
            />

            {
              selectedFile ? (

                <div className="flex flex-col items-center">

                  {
                    mode === "img-to-pdf" && preview ? (

                      <img
                        src={preview}
                        alt="Preview"
                        className="w-52 rounded-2xl shadow-2xl mb-6"
                      />

                    ) : (

                      <div className="text-7xl mb-6">
                        📄
                      </div>

                    )
                  }

                  <p className="text-xl font-semibold break-all text-center">
                    {selectedFile.name}
                  </p>

                </div>

              ) : (

                <div className="text-center">

                  <p className="text-3xl font-bold mb-3">
                    Upload Your File
                  </p>

                  <p className="text-gray-400">
                    Click here to browse files
                  </p>

                </div>

              )
            }

          </label>

          {/* Convert Button */}

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-purple-500 to-pink-500 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition disabled:opacity-50"
          >

            {
              loading ? (
                <ClipLoader
                  color="#ffffff"
                  size={28}
                />
              ) : (
                "Convert Now"
              )
            }

          </button>

        </div>

      </motion.section>

      {/* FAQ Section */}

      <motion.section className="max-w-5xl mx-auto px-6 py-20">

        <h2 className="text-5xl font-bold text-center mb-14">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">

          <div className="bg-white/5 rounded-3xl p-8">

            <h3 className="text-2xl font-bold mb-3">
              Is maygamstools free?
            </h3>

            <p className="text-gray-400">
              Yes, all current tools are completely free to use.
            </p>

          </div>

          <div className="bg-white/5 rounded-3xl p-8">

            <h3 className="text-2xl font-bold mb-3">
              Are my files secure?
            </h3>

            <p className="text-gray-400">
              Yes, uploaded files are processed securely.
            </p>

          </div>

          <div className="bg-white/5 rounded-3xl p-8">

            <h3 className="text-2xl font-bold mb-3">
              Which formats are supported?
            </h3>

            <p className="text-gray-400">
              PNG, JPG, JPEG and PDF formats are currently supported.
            </p>

          </div>

        </div>

      </motion.section>

      {/* Footer */}

      <footer className="border-t border-white/10 py-8 text-center text-gray-500">

        <div className="flex items-center justify-center gap-3 mb-3">

          <FaGithub />

     

        </div>

        <p>
          © 2026 maygamstools. All rights reserved.
        </p>

      </footer>

    </div>
  );
}