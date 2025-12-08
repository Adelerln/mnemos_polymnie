export const formatFrenchPhoneNumber = (input: string): string => {
  const digits = input.replace(/\D/g, "").slice(0, 10);
  const groups = digits.match(/.{1,2}/g) ?? [];
  return groups.join(" ");
};
