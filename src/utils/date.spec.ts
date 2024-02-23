import { getFormattedDate, getReportYear } from "./date";

describe("Function: getFormattedDate", () => {
  it("returns the correctly formatted date", () => {
    const thisDate = new Date("1990-12-20T00:00:00");
    expect(getFormattedDate(thisDate)).toEqual("1990-12-20");
  });
  it("does not change the time zone", () => {
    const thisDate = new Date("1990-12-20T23:59:59");
    expect(getFormattedDate(thisDate)).toEqual("1990-12-20");
  });
  it("does not append the day when instructed", () => {
    const thisDate = new Date("1990-12-20");
    expect(getFormattedDate(thisDate, true)).toEqual("1990-12");
  });
});

describe("Function: getReportYear", () => {
  it("returns the current year by default", () => {
    expect(getReportYear()).toEqual(`${new Date().getFullYear()}`);
  });
  it("respects the year argument", () => {
    expect(getReportYear({ year: "1990" })).toEqual("1990");
  });
  it("respects the date argument", () => {
    expect(getReportYear({ date: "1990-12-20" })).toEqual("1990");
  });
  it("respects the year argument over date", () => {
    expect(getReportYear({ date: "1990-12-20", year: "1991" })).toEqual("1991");
  });
});
