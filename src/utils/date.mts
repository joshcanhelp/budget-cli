import { padLeftZero } from "./index.mjs";

export const getFormattedDate = (date: Date = new Date()): string => {
  const yyyy = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return yyyy + "-" + padLeftZero(month) + "-" + padLeftZero(day);
};
