import { Link } from "react-router-dom";

export default function AuthHeader({ rightText, rightLink, rightLabel }) {
  return (
    <header className="absolute top-0 left-0 right-0 px-6 py-6 flex justify-between">
      <div className="text-white font-bold text-lg">OrbitDev</div>

      <div className="text-sm text-slate-400">
        {rightText}{" "}
        <Link to={rightLink} className="text-white hover:text-primary">
          {rightLabel}
        </Link>
      </div>
    </header>
  );
}
