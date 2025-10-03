"use client";

import { authClient } from "@/app/lib/auth-client"; //import the auth client
import messagesAuth from "@/app/lib/data/messages/auth.json";
import { useState } from "react";

export default function SignUp() {
  const [error, setError] = useState("");

  async function Signup() {
    // TODO: get values from the form and add basic validation
    const email = "";
    const password = "";
    const name = "";
    const image = "";

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
          alert(ctx.error.message);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-black px-8 py-2 mx-auto gap-2 lg:px-16 lg:rounded-r-lg">
        Sign up to Couple Cents and make smarter money decisions every day.
      </div>
      {/* checkbox for privacy policy */}

      <div className="flex flex-col w-full">
        <label htmlFor="name" className="text-left ">
          {messagesAuth.signup.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder={messagesAuth.signup.namePlaceholder}
          className="border rounded-lg p-2 w-full mb-4"
        />
        <label htmlFor="email" className="text-left ">
          {messagesAuth.signup.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder={messagesAuth.signup.emailPlaceholder}
          className="border rounded-lg p-2 w-full mb-4"
        />
        <label htmlFor="name" className="text-left ">
          {messagesAuth.signup.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder={messagesAuth.signup.passwordPlaceholder}
          className="border rounded-lg p-2 w-full mb-4"
        />
        <label htmlFor="confirm-password" className="text-left ">
          {messagesAuth.signup.confirmPassword}
        </label>
        <input
          id="confirm-password"
          name="confirm-password"
          type="password"
          placeholder={messagesAuth.signup.confirmPasswordPlaceholder}
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
          {messagesAuth.signup.newAccountMessage}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            {messagesAuth.signup.termsAndPrivacy}
          </a>
        </label>
      </div>
      {/* sign up button */}
      {/* on click call the signup function */}
      <button
        onClick={Signup}
        className={` h-10 text-center items-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`}
      >
        {messagesAuth.signup.newAccount}
      </button>
    </div>
  );
}
