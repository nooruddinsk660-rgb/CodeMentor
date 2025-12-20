import { Link } from "react-router-dom";
export default function AuthFooter({ text, linkText, linkTo }) {
  return (
    <p className="mt-6 text-center text-sm text-slate-500">
      {text}{" "}
      <Link to={linkTo} className="text-primary hover:underline cursor-pointer">
        {linkText}
      </Link>
    </p>
  );
}
