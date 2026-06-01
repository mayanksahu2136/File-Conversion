export default function Loader({ size = 20 }) {
  return (
    <div
      className="rounded-full border-2 border-t-transparent animate-spin border-white/80"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
