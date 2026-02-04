import { Link } from "react-router-dom";

export default function AuthFooter({ text, linkText, linkTo }) {
  return (
    <p className="mt-8 text-center text-sm text-gray-400">
      {text}{" "}
      <Link to={linkTo} className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors">
        {linkText}
      </Link>
    </p>
  );
}
