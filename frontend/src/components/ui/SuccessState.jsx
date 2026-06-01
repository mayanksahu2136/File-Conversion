export default function SuccessState({ title = "Done", message }) {
  return (
    <div role="status" className="p-4 rounded-xl bg-green-500/8 border border-green-500/20">
      <div className="font-semibold text-green-200">{title}</div>
      {message && <div className="text-sm text-green-100 mt-1">{message}</div>}
    </div>
  );
}
