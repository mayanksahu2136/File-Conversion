import { Link } from "react-router-dom";

export default function ToolCard({
  title,
  description,
  path,
  status = "Live",
}) {
  return (
    <Link to={path}>
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:-translate-y-2 hover:border-purple-500/50 transition-all duration-300">

        <div className="flex justify-between items-center mb-4">

          <h3 className="text-xl font-bold">
            {title}
          </h3>

          <span
            className={`text-xs px-3 py-1 rounded-full ${
              status === "Live"
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {status}
          </span>

        </div>

        <p className="text-gray-400">
          {description}
        </p>

      </div>
    </Link>
  );
}