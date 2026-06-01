export default function PageHeader({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl text-white shadow-glass">
        {icon}
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        <p className="text-gray-400 mt-1 max-w-xl">{description}</p>
      </div>
    </div>
  );
}
