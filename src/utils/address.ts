import nameGenerator from "mnemonic-generator";

export function areAddressesEqual(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

function capitalize(str: string) {
  return `${str.charAt(0).toUpperCase()}${str.substring(1)}`;
}

export function capitalizedNameGenerator(address: string) {
  const generatedName = nameGenerator(address);
  const words = generatedName.split(" ");
  return words.map(capitalize).join(" ");
}
