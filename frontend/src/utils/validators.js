export function isRequired(value) {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  );
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 6
  );
}