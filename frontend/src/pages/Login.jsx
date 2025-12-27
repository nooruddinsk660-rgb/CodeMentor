import AuthLayout from "../components/authentication/AuthLayout";
import AuthCard from "../components/authentication/AuthCard";
import AuthTitle from "../components/authentication/AuthTitle";
import AuthDivider from "../components/authentication/AuthDivider";
import SocialAuthButton from "../components/authentication/SocialAuthButton";
import AuthFooter from "../components/authentication/AuthFooter";
import LoginForm from "../components/authentication/LoginForm";

export default function Login() {
  return (
    <AuthLayout>
      <AuthCard>
        <AuthTitle
          title="Log in to your account"
          subtitle="Welcome back, developer."
        />

        <LoginForm />

        <AuthDivider />
        
        {/* 4. Connect the Button */}
        <SocialAuthButton text="Sign in with GitHub" />
        
        <AuthFooter text="Don't have an account?" linkText="Sign up" linkTo="/signup" />
      </AuthCard>
    </AuthLayout>
  );
}