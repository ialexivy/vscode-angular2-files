export const camelCase = (input: string) => {
  return input.replace(/-([a-z])/ig, (all, letter) => letter.toUpperCase());
};

export const toUpperCase = (input: string) => {
  const inputUpperCase = input.charAt(0).toUpperCase() + input.slice(1);
  return this.camelCase(inputUpperCase);
};
