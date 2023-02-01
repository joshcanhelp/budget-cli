import { padLeftZero } from "./index.mjs";

export const getFormattedDate = (date: Date = new Date()): string => {
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  return yyyy + "-" + padLeftZero(mm) + "-" + padLeftZero(dd);
};
