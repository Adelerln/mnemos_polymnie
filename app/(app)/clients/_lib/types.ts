/** Types locaux de la page clients */

export type CityLookupState = "idle" | "loading" | "error";

export type AddressSuggestion = {
  label: string;
  address: string;
  city: string;
  postcode: string;
};
