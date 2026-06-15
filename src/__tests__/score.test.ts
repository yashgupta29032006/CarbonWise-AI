import { calculateCarbonScore } from "../utils/scoreGenerator";

describe("Carbon Score Generation Logic", () => {
  test("returns score 100 for emissions under 2000 kg CO2/year", () => {
    const scoreInfo = calculateCarbonScore(1500);
    expect(scoreInfo.score).toBe(100);
    expect(scoreInfo.band).toBe("Excellent");
  });

  test("calculates score correctly for sustainable targets", () => {
    // Emissions of 3500 should output score around 86
    const scoreInfo = calculateCarbonScore(3500);
    expect(scoreInfo.score).toBe(86);
    expect(scoreInfo.band).toBe("Excellent");
  });

  test("assigns correct rating bands based on score ranges", () => {
    // 80+ Excellent
    const excellent = calculateCarbonScore(4000);
    expect(excellent.score).toBe(82);
    expect(excellent.band).toBe("Excellent");

    // 60-79 Good
    const good = calculateCarbonScore(7000);
    expect(good.score).toBe(61);
    expect(good.band).toBe("Good");

    // 40-59 Moderate
    const moderate = calculateCarbonScore(10000);
    expect(moderate.score).toBe(45);
    expect(moderate.band).toBe("Moderate");

    // 20-39 High
    const high = calculateCarbonScore(15000);
    expect(high.score).toBe(27);
    expect(high.band).toBe("High");

    // <20 Critical
    const critical = calculateCarbonScore(25000);
    expect(critical.score).toBe(10);
    expect(critical.band).toBe("Critical");
  });

  test("clamps minimum score to 0", () => {
    const scoreInfo = calculateCarbonScore(1000000); // extreme footprint
    expect(scoreInfo.score).toBe(0);
    expect(scoreInfo.band).toBe("Critical");
  });
});
