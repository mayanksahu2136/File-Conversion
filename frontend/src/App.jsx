import { useState } from "react";

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
        `http://127.0.0.1:8000/${endpoint}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;

      if (mode === "img-to-pdf") {
        a.download = "converted.pdf";
      } else {
        a.download = `converted.${imageFormat}`;
      }

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error(error);

      alert("Something went wrong 😢");

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8">

        <h1 className="text-5xl font-bold text-center mb-3">
          File Converter
        </h1>

        <p className="text-gray-500 text-center mb-8 text-lg">
          Convert files instantly
        </p>

        <div className="flex gap-4 mb-8">

          <button
            onClick={() => {
              setMode("img-to-pdf");
              setSelectedFile(null);
              setPreview(null);
            }}
            className={`flex-1 py-3 rounded-2xl font-semibold transition ${
              mode === "img-to-pdf"
                ? "bg-black text-white"
                : "bg-gray-200"
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
            className={`flex-1 py-3 rounded-2xl font-semibold transition ${
              mode === "pdf-to-img"
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
            PDF → Image
          </button>

        </div>

        {
          mode === "pdf-to-img" && (
            <select
              value={imageFormat}
              onChange={(e) => setImageFormat(e.target.value)}
              className="w-full mb-6 p-4 rounded-2xl border"
            >

              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="jpeg">JPEG</option>

            </select>
          )
        }

        <label
          htmlFor="fileUpload"
          className="border-2 border-dashed border-gray-300 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition"
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

    <div className="w-full flex flex-col items-center">

      {
        mode === "img-to-pdf" && preview ? (

          <img
            src={preview}
            alt="Preview"
            className="w-60 rounded-2xl shadow-lg mb-5"
          />

        ) : (

          <div className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center mb-5 text-5xl">

            📄

          </div>

        )
      }

      <p className="font-semibold text-lg text-center break-all">

        {selectedFile.name}

      </p>

    </div>

  ) : (

    <div className="text-center">

      <p className="text-2xl font-semibold mb-3">
        Click to Upload
      </p>

      <p className="text-gray-400">

        {
          mode === "img-to-pdf"
            ? "PNG, JPG, JPEG"
            : "PDF Files"
        }

      </p>

    </div>
  )
}

        </label>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="w-full mt-8 bg-black text-white py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition disabled:opacity-50"
        >

          {
            loading
              ? "Converting..."
              : "Convert Now"
          }

        </button>

      </div>

    </div>
  );
}