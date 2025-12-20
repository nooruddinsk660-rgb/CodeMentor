import AuthLayout from "../components/authentication/AuthLayout";
import AuthCard from "../components/authentication/AuthCard";
import AuthTitle from "../components/authentication/AuthTitle";
import AuthDivider from "../components/authentication/AuthDivider";
import SocialAuthButton from "../components/authentication/SocialAuthButton";
import AuthFooter from "../components/authentication/AuthFooter";
import SignUpForm from "../components/authentication/SignUpForm";

export default function SignUp() {
  return (
    <AuthLayout>
      <AuthCard>
        <AuthTitle
          title="Create your account"
          subtitle="Join the AI Mentorship Revolution."
        />

        {/* ✅ CONNECTED FORM */}
        <SignUpForm />

        <AuthDivider />
        <SocialAuthButton text="Sign up with GitHub" />
        <AuthFooter text="Already have an account?" linkText="Login" linkTo="/login"/>
      </AuthCard>
    </AuthLayout>
  );
}
