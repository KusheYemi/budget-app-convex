const DEFAULT_MESSAGES = {
  signIn: "We couldn't sign you in. Check your email and password and try again.",
  signUp: "We couldn't create your account. Please try again.",
  reset: "We couldn't reset your password. Please try again.",
} as const;

const matches = (value: string, patterns: string[]) =>
  patterns.some((pattern) => value.includes(pattern));

export type AuthErrorContext = keyof typeof DEFAULT_MESSAGES;

export function getAuthErrorMessage(error: unknown, context: AuthErrorContext) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  if (!normalized) {
    return DEFAULT_MESSAGES[context];
  }

  if (
    context === "reset" &&
    matches(normalized, ["missing `newpassword`", "invalid password"])
  ) {
    return "Choose a stronger password with at least 8 characters.";
  }

  if (matches(normalized, ["password reset is not enabled"])) {
    return "Password reset isn't available yet. Please contact support.";
  }

  if (
    matches(normalized, [
      "missing resend_api_key",
      "missing resend_from_email",
      "missing resend_smtp_password",
      "missing resend_smtp_password or resend_from_email",
      "missing resend_api_key or resend_from_email",
    ])
  ) {
    return "Password reset isn't available yet. Please contact support.";
  }

  if (
    matches(normalized, [
      "invalid code",
      "could not verify code",
      "expired verification code",
    ])
  ) {
    return "This reset link is invalid or has expired. Request a new one.";
  }

  if (
    matches(normalized, [
      "token verification requires an `email`",
      "requires a matching `email`",
    ])
  ) {
    return "Enter the email you used to create your account.";
  }

  if (
    matches(normalized, [
      "already exists",
      "email already in use",
      "account already exists",
    ])
  ) {
    return "This email is already registered. Try signing in instead.";
  }

  if (
    matches(normalized, [
      "invalid credentials",
      "invalid password",
      "incorrect password",
      "wrong password",
    ])
  ) {
    return "Incorrect email or password.";
  }

  if (
    matches(normalized, [
      "no account",
      "account not found",
      "user not found",
      "does not exist",
    ])
  ) {
    return "We couldn't find an account with that email.";
  }

  if (matches(normalized, ["too many", "rate limit", "throttl"])) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (matches(normalized, ["password too weak", "weak password", "strength"])) {
    return "Choose a stronger password to continue.";
  }

  if (
    matches(normalized, [
      "invalid rsa",
      "privatekeyinfo",
      "jwt",
      "secret",
      "pem",
    ])
  ) {
    return "Authentication is temporarily unavailable. Please try again soon.";
  }

  if (matches(normalized, ["network", "fetch", "timeout", "socket", "offline"])) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  return DEFAULT_MESSAGES[context];
}
