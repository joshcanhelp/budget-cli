import { padLeftZero } from "./";

describe("Function: padLeftZero", () => {
  it("pads a single digit with a zero", () => {
    expect(padLeftZero(1)).toEqual("01");
  });
  it("does not pad 2 digits", () => {
    expect(padLeftZero(11)).toEqual("11");
  });
  it("does not pad 3 digits", () => {
    expect(padLeftZero(111)).toEqual("111");
  });
});
