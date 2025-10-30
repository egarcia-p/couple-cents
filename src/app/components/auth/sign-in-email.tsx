"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { useTranslations } from "next-intl";

export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const t = useTranslations("LoginComponent");

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStep("password");
      setError("");
    } else {
      setError("Incorrect email. Try again.");
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: (ctx) => {
          //show loading
        },
        onSuccess: (ctx) => {
          //redirect to the dashboard or sign in page
          router.push("/dashboard");
          setError("");
        },
        onError: (ctx) => {
          // display the error message
          setError(t("invalidCredentials"));
        },
      },
    );

    // const captchaToken = await grecaptcha.execute("SITE_KEY", {
    //   action: "login",
    // });

    // const res = await fetch("/api/auth/login", {
    //   method: "POST",
    //   body: JSON.stringify({ email, password, captchaToken }),
    // });

    // if (res.ok) {
    //   window.location.href = "/dashboard";
    // } else {
    //   alert("Invalid credentials or captcha");
    // }
  }

  return (
    <div className="max-w-md mx-auto">
      {step === "email" && (
        <form onSubmit={handleEmailSubmit}>
          <div className="flex flex-col gap-4 mb-4 ">
            <input
              type="email"
              className="border rounded-lg p-2"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className={` h-10 text-center items-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`}
            >
              {t("emailButton")}
            </button>
          </div>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-4 mb-4 ">
            <input
              type="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-lg p-2"
              required
            />
            {/* Captcha runs in handleLogin */}
            <button
              type="submit"
              className={` h-10 text-center items-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`}
            >
              {t("loginButton")}
            </button>
          </div>
        </form>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
