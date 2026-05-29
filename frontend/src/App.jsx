import { useState } from "react";

export default function App() {

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleConvert = async () => {

  if (!selectedFile) {
    alert("Please select an image first");
    return;
  }

  try {

    const formData = new FormData();

    formData.append("file", selectedFile);

    const response = await fetch(
      "http://127.0.0.1:8000/img-to-pdf",
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
    a.download = "converted.pdf";

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

  } catch (error) {

    console.error(error);

    alert("Something went wrong 😢");
  }
};

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">

      <div className="w-full max-w-xl bg-white shadow-2xl rounded-3xl p-8 border">

        <h1 className="text-4xl font-bold text-center mb-3">
          File Converter
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Convert Images into PDF easily
        </p>

        <div className="border-2 border-dashed rounded-2xl p-10 text-center hover:bg-gray-50 transition">

          <input
            type="file"
            className="hidden"
            id="fileUpload"
            accept="image/*"
            onChange={handleFileChange}
          />

          <label
            htmlFor="fileUpload"
            className="cursor-pointer"
          >

            {
              selectedFile ? (
                <div>

                  <p className="text-lg font-semibold text-green-600">
                    File Selected ✅
                  </p>

                  <p className="mt-2 text-gray-600">
                    {selectedFile.name}
                  </p>

                </div>
              ) : (
                <div>

                  <p className="text-lg font-medium">
                    Click to Upload Image
                  </p>

                  <p className="text-sm text-gray-400 mt-2">
                    PNG, JPG, JPEG
                  </p>

                </div>
              )
            }

          </label>

        </div>

        <button
          onClick={handleConvert}
          className="w-full mt-8 bg-black text-white py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition"
        >

          Convert to PDF

        </button>

      </div>

    </div>
  );
}