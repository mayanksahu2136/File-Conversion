export default function EmptyState({ title = "No files yet", description = "Upload a PDF to get started." }) {
  return (
    <div className="py-12 px-6 text-center glass-card rounded-2xl">
      <div className="text-6xl mb-4">📄</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-400 mt-2">{description}</p>
    </div>
  );
}
