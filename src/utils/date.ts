import { padLeftZero } from "./index.js";

////
/// Functions
//

export const getFormattedDate = (
  date: Date = new Date(),
  excludeDay = false
): string => {
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();

  const dateAppend = excludeDay ? "" : `-${padLeftZero(dd)}`;
  return `${yyyy}-` + padLeftZero(mm) + dateAppend;
};
