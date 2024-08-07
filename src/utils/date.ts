import { padLeftZero } from "./index.js";

export const dateRegex = /^[0-9]{4}(?:-[0-9]{2})?(?:-[0-9]{2})?$/;

////
/// Functions
//

export const getFormattedDate = (date = new Date(), excludeDay = false): string => {
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();

  const dateAppend = excludeDay ? "" : `-${padLeftZero(dd)}`;
  return `${yyyy}-` + padLeftZero(mm) + dateAppend;
};

export const getReportYear = (cliArgs?: {
  date?: string;
  year?: string;
}): string => {
  const { date, year } = cliArgs || {};
  if (year) {
    return year;
  } else if (date) {
    return date.split("-")[0];
  }
  return new Date().getFullYear().toString();
};
