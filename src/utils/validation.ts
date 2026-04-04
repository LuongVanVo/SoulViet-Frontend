export function isValidInput(value: string): boolean {
  return !!(value && value.trim().length > 0);
}

export function isValidPassword(password: string): boolean {
  return !!(password && password.length >= 6);
}

export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getValidationMessage(emailOrUsername: string): string {
  if (!emailOrUsername) {
    return 'profile.auth.errors.emailUsernameEmpty';
  }
  if (emailOrUsername.trim().length < 2) {
    return 'profile.auth.errors.emailUsernameTooShort';
  }
  return '';
}

export function getValidationEmailMessage(email: string): string {
  if (!email) {
    return '';
  }
  if (!isValidEmail(email)) {
    return 'profile.auth.errors.invalidEmail';
  }
  return '';
}

export function getPasswordValidationMessage(password: string): string {
  if (!password) {
    return '';
  }
  if (password.length < 6) {
    return 'profile.auth.errors.passwordTooShort';
  }
  return '';
}

export function getPasswordMatchMessage(password: string, confirmPassword: string): string {
  if (!confirmPassword) {
    return '';
  }
  if (password !== confirmPassword) {
    return 'profile.auth.errors.passwordMismatch';
  }
  return '';
}
