export const Theme = {
  Light: "light",
  Dark: "dark",
};
export type Theme = (typeof Theme)[keyof typeof Theme];
