"use client";

import { authClient } from "@/app/lib/auth-client"; //import the auth client
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SignUp() {
  const [error, setError] = useState("");
  const t = useTranslations("SignUpComponent");

  async function Signup() {
    // Get values from the form
    const nameInput = document.getElementById("name") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById(
      "password",
    ) as HTMLInputElement;
    const confirmPasswordInput = document.getElementById(
      "confirm-password",
    ) as HTMLInputElement;

    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    const name = nameInput?.value.trim() || "";
    const confirmPassword = confirmPasswordInput?.value || "";
    const image = "";

    // Basic validation
    if (!name) {
      setError(t("validation.nameRequired"));
      return;
    }
    if (!email) {
      setError(t("validation.emailRequired"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("validation.emailInvalid"));
      return;
    }
    if (!password) {
      setError(t("validation.passwordRequired"));
      return;
    }
    if (password.length < 8) {
      setError(t("validation.passwordMinLength"));
      return;
    }
    if (!confirmPassword) {
      setError(t("validation.confirmPasswordRequired"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("validation.passwordMismatch"));
      return;
    }

    setError(""); // Clear any previous errors

    const { data, error } = await authClient.signUp.email(
      {
        email, // user email address
        password, // user password -> min 8 characters by default
        name, // user display name
        image, // User image URL (optional)
        callbackURL: "/dashboard", // A URL to redirect to after the user verifies their email (optional)
      },
      {
        onRequest: (ctx) => {
          //show loading
        },
        onSuccess: (ctx) => {
          //redirect to the dashboard or sign in page
        },
        onError: (ctx) => {
          // display the error message
          console.log("Sign up error:", ctx.error);
          setError(ctx.error.message);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-black px-8 py-2 mx-auto gap-2 lg:px-16 lg:rounded-r-lg">
        {t("description")}
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-col w-full">
        <label htmlFor="name" className="text-left ">
          {t("name")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder={t("namePlaceholder")}
          className="border rounded-lg p-2 w-full mb-4"
        />
        <label htmlFor="email" className="text-left ">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          className="border rounded-lg p-2 w-full mb-4"
        />
        <label htmlFor="name" className="text-left ">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder={t("passwordPlaceholder")}
          className="border rounded-lg p-2 w-full mb-4"
        />
        <label htmlFor="confirm-password" className="text-left ">
          {t("confirmPassword")}
        </label>
        <input
          id="confirm-password"
          name="confirm-password"
          type="password"
          placeholder={t("confirmPasswordPlaceholder")}
          className="border rounded-lg p-2 w-full max-w-md my-4"
        />
      </div>
      <div className="flex items-center">
        {/* <input
          id="remember"
          name="remember"
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        /> */}
        <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
          {t("newAccountMessage")}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            {t("termsAndPrivacy")}
          </a>
        </label>
      </div>
      {/* sign up button */}
      {/* on click call the signup function */}
      <button
        onClick={Signup}
        className={` h-10 text-center items-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`}
      >
        {t("newAccount")}
      </button>
    </div>
  );
}
