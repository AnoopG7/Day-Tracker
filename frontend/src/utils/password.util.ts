/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 15;
  return Math.min(100, strength);
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(strength: number): 'error' | 'warning' | 'success' {
  if (strength < 50) return 'error';
  if (strength < 75) return 'warning';
  return 'success';
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
  if (strength < 50) return 'Weak';
  if (strength < 75) return 'Medium';
  return 'Strong';
}
