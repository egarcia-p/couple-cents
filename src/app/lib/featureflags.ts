export const featureFlags = {
  signUp: process.env.NEXT_PUBLIC_SIGN_UP === "true",
  googleSignIn: process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN === "true",
};
