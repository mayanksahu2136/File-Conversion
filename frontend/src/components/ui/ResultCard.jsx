import Button from "./Button";

export default function ResultCard({ page, src, filename }) {
  const isAbsolute = src && src.startsWith("http");
  const href = isAbsolute ? src : src;

  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
      <div className="bg-black/40 p-3">
        <div className="text-sm text-gray-300">Page {page}</div>
      </div>

      <div className="p-4">
        <img src={href} alt={filename} className="w-full rounded-lg object-contain max-h-52 mx-auto" />
      </div>

      <div className="p-4 border-t border-white/6 flex items-center justify-between gap-4">
        <div className="truncate">{filename}</div>
        <a href={href} target="_blank" rel="noreferrer" download>
          <Button className="px-4 py-2">Download</Button>
        </a>
      </div>
    </div>
  );
}
