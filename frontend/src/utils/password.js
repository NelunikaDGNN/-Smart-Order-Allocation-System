
export const PASSWORD_RULES = [
  { key: 'length',    label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter',   test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter',   test: (p) => /[a-z]/.test(p) },
  { key: 'number',    label: 'One number',             test: (p) => /\d/.test(p) },
  { key: 'special',   label: 'One special character',  test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function isPasswordValid(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}