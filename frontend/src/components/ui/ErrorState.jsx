export default function ErrorState({ title = "Something went wrong", message }) {
  return (
    <div role="alert" className="p-4 rounded-xl bg-red-600/10 border border-red-600/20">
      <div className="font-semibold text-red-300">{title}</div>
      {message && <div className="text-sm text-red-200 mt-1">{message}</div>}
    </div>
  );
}
