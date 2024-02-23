import { CommandArgs } from "../cli.js";
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

export const getReportYear = (cliArgs?: CommandArgs): string => {
  const { date, year } = cliArgs || {};
  let reportYear = new Date().getFullYear().toString();
  if (year) {
    reportYear = year as string;
  } else if (date) {
    reportYear = (date as string).split("-")[0];
  }
  return reportYear;
};
