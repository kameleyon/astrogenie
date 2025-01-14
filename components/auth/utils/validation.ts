export const validateSignUpForm = (
  email: string,
  password: string,
  confirmPassword: string,
  agreeToTerms: boolean
): string | null => {
  if (!email || !password || !confirmPassword) {
    return "Please fill in all fields";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  if (!agreeToTerms) {
    return "Please agree to the terms and conditions";
  }

  return null;
};
