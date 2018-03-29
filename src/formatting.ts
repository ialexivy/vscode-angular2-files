export const toCamelCase = (input: string) => {
  return input.replace(/-([a-z])/ig, (all, letter) => letter.toUpperCase());
};

export const toTileCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

export const toUpperCase = (input: string) => {
  const inputUpperCase = input.charAt(0).toUpperCase() + input.slice(1);
  return toCamelCase(inputUpperCase);
};
