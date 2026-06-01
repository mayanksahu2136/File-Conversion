import { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { API_URL } from "../config";

export default function PdfToImg() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFormat, setImageFormat] = useState("png");
  const [images, setImages] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setImages([]);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("format", imageFormat);

      const response = await fetch(
        `${API_URL}/pdf-to-img`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Conversion failed"
        );
      }

      setImages(data.images || []);

      toast.success(
        `${data.total_pages} pages converted successfully`
      );

    } catch (error) {
      console.error(error);
      toast.error(
        error.message || "Conversion failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white px-4 py-12">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-4">
          PDF to Image Converter
        </h1>

        <p className="text-center text-gray-400 mb-10">
          Convert PDF files into PNG, JPG or JPEG images.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <select
            value={imageFormat}
            onChange={(e) =>
              setImageFormat(e.target.value)
            }
            className="w-full mb-6 p-4 rounded-2xl bg-black border border-white/10"
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="jpeg">JPEG</option>
          </select>

          <label
            htmlFor="pdfUpload"
            className="border-2 border-dashed border-white/20 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
          >
            <input
              type="file"
              id="pdfUpload"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">

                <div className="text-7xl mb-4">
                  📄
                </div>

                <p className="text-lg font-semibold break-all text-center">
                  {selectedFile.name}
                </p>

              </div>
            ) : (
              <div className="text-center">

                <FaFilePdf className="text-6xl mx-auto mb-4 text-red-400" />

                <h2 className="text-2xl font-bold mb-2">
                  Upload PDF
                </h2>

                <p className="text-gray-400">
                  Click here to select PDF file
                </p>

              </div>
            )}
          </label>

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-purple-500 to-pink-500 py-4 rounded-2xl font-bold text-lg"
          >
            {loading ? (
              <ClipLoader
                color="#ffffff"
                size={24}
              />
            ) : (
              "Convert to Images"
            )}
          </button>
        </div>

        {images.length > 0 && (
          <div className="mt-10">

            <h2 className="text-3xl font-bold mb-6">
              Converted Pages
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {images.map((img) => (
                <div
                  key={img.page}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4"
                >

                  <h3 className="font-semibold mb-3">
                    Page {img.page}
                  </h3>

                  <img
                    src={`${API_URL}${img.download_url}`}
                    alt={`Page ${img.page}`}
                    className="w-full rounded-xl border border-white/10"
                  />

                  <a
                    href={`${API_URL}${img.download_url}`}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="block mt-4 text-center bg-purple-600 hover:bg-purple-700 py-2 rounded-xl"
                  >
                    Download
                  </a>

                </div>
              ))}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}