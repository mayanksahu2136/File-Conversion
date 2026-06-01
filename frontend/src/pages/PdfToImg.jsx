import { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
const API_URL =
  "https://file-conversion-backend-3vbm.onrender.com";

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
import { useState } from "react";
import toast from "react-hot-toast";
import { FaFilePdf } from "react-icons/fa";

import PageHeader from "../components/ui/PageHeader";
import UploadBox from "../components/ui/UploadBox";
import Button from "../components/ui/Button";
import ResultCard from "../components/ui/ResultCard";
import EmptyState from "../components/ui/EmptyState";
import SectionTitle from "../components/ui/SectionTitle";

const API_URL = "https://file-conversion-backend-3vbm.onrender.com";

export default function PdfToImg() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFormat, setImageFormat] = useState("png");
  const [images, setImages] = useState([]);

  function handleFileChange(file) {
    setSelectedFile(file);
    setImages([]);
  }

  async function handleConvert() {
    if (!selectedFile) {
      toast.error("Please select a PDF file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("format", imageFormat);

      const res = await fetch(`${API_URL}/pdf-to-img`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Conversion failed");

      setImages(data.images || []);
      toast.success(`${data.total_pages} pages converted`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Conversion failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          icon={<FaFilePdf />}
          title="PDF to Image"
          description="Convert PDF pages into individual PNG or JPG images."
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass-card p-6 rounded-2xl">
              <SectionTitle title="Upload" subtitle="Add your PDF file to begin" />

              <UploadBox file={selectedFile} onFileChange={handleFileChange} />

              <div className="mt-6">
                <SectionTitle title="Settings" subtitle="Choose output format" />

                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/6"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="jpeg">JPEG</option>
                </select>

                <div className="mt-6">
                  <Button loading={loading} onClick={handleConvert} className="w-full">
                    Convert
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl">
              <SectionTitle title="Result Preview" subtitle="Converted pages appear here" />

              {images.length === 0 ? (
                <EmptyState title="No results yet" description="Converted images will appear here." />
              ) : (
                <div className="space-y-4">
                  {images.map((img) => (
                    <ResultCard key={img.page} page={img.page} src={img.download_url.startsWith('http') ? img.download_url : `${API_URL}${img.download_url}`} filename={img.filename} />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}