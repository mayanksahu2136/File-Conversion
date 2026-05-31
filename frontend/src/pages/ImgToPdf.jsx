import { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

export default function ImgToPdf() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);

      if (file.type.startsWith("image")) {
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "https://file-conversion-backend-3vbm.onrender.com/img-to-pdf",
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

      a.download = `${originalName}.pdf`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded");
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
          Image to PDF Converter
        </h1>

        <p className="text-center text-gray-400 mb-10">
          Convert JPG, PNG and other images into PDF files instantly.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

          <label
            htmlFor="imageUpload"
            className="border-2 border-dashed border-white/20 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition"
          >

            <input
              type="file"
              id="imageUpload"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">

                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-56 rounded-2xl mb-6"
                  />
                )}

                <p className="text-lg font-semibold">
                  {selectedFile.name}
                </p>

              </div>
            ) : (
              <div className="text-center">

                <FaFilePdf className="text-6xl mx-auto mb-4 text-red-400" />

                <h2 className="text-2xl font-bold mb-2">
                  Upload Image
                </h2>

                <p className="text-gray-400">
                  Click here to select image
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
              <ClipLoader color="#fff" size={24} />
            ) : (
              "Convert to PDF"
            )}

            


          </button>

        </div>

      </div>

    </div>
  );
}