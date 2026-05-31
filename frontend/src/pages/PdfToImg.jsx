import { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

export default function PdfToImg() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFormat, setImageFormat] = useState("png");

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
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
        "https://file-conversion-backend-3vbm.onrender.com/pdf-to-img",
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

      a.download = `${originalName}.${imageFormat}`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Image downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white px-4 py-12">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-4">
          PDF to Image Converter
        </h1>

        <p className="text-center text-gray-400 mb-10">
          Convert PDF files into PNG, JPG or JPEG images.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <select
            value={imageFormat}
            onChange={(e) => setImageFormat(e.target.value)}
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
              "Convert to Image"
            )}

          </button>

        </div>

      </div>

    </div>
  );
}