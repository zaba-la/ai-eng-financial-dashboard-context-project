import { describe, expect, it } from "vitest";

import {
  computeKPIs,
  computeMonthlyData,
  formatCurrency,
  formatPercent,
  formatPeriodLabel,
} from "./financial-utils";
import type { FinancialMovement } from "./financial-types";

const sampleMovements: FinancialMovement[] = [
  {
    create_date: "2024-01-10",
    amount: 1000,
    operation_type: "income",
    category: "sales",
    business_type: "B2B",
  },
  {
    create_date: "2024-01-15",
    amount: 250,
    operation_type: "outcome",
    category: "suppliers",
    business_type: "B2B",
  },
  {
    create_date: "2024-02-01",
    amount: 500,
    operation_type: "income",
    category: "sales",
    business_type: "B2C",
  },
];

describe("computeKPIs", () => {
  it("calculates totals and profit values", () => {
    const metrics = computeKPIs(sampleMovements);

    expect(metrics).toEqual({
      totalIncome: 1500,
      totalOutcome: 250,
      profit: 1250,
      profitPercent: (1250 / 1500) * 100,
    });
  });

  it("returns 0 profitPercent when there is no income", () => {
    const onlyOutcomes: FinancialMovement[] = [
      {
        create_date: "2024-03-05",
        amount: 350,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
    ];

    const metrics = computeKPIs(onlyOutcomes);
    expect(metrics.profitPercent).toBe(0);
  });
});

describe("computeMonthlyData", () => {
  it("returns chronological year-month points with aggregated totals", () => {
    const unsortedCrossYearMovements: FinancialMovement[] = [
      {
        create_date: "2026-01-08",
        amount: 300,
        operation_type: "income",
        category: "sales",
        business_type: "B2C",
      },
      {
        create_date: "2025-12-05",
        amount: 200,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
      {
        create_date: "2025-12-03",
        amount: 1000,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
    ];
    const monthlyData = computeMonthlyData(unsortedCrossYearMovements);

    expect(monthlyData).toHaveLength(2);
    expect(monthlyData[0]).toEqual({
      month: "Dec 2025",
      income: 1000,
      outcome: 200,
      profitPercent: 80,
    });
    expect(monthlyData[1]).toEqual({
      month: "Jan 2026",
      income: 300,
      outcome: 0,
      profitPercent: 100,
    });
  });

  it("keeps movements on the 1st of the month in that month in any timezone", () => {
    const firstOfMonthMovements: FinancialMovement[] = [
      {
        create_date: "2026-01-01",
        amount: 400,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
      {
        create_date: "2025-12-01",
        amount: 100,
        operation_type: "outcome",
        category: "suppliers",
        business_type: "B2C",
      },
    ];

    const monthlyData = computeMonthlyData(firstOfMonthMovements);

    expect(monthlyData.map((point) => point.month)).toEqual([
      "Dec 2025",
      "Jan 2026",
    ]);
    expect(monthlyData[1].income).toBe(400);
  });
});

describe("formatPeriodLabel", () => {
  it("spans the first and last month of the data", () => {
    const points = computeMonthlyData([
      ...sampleMovements,
      {
        create_date: "2025-03-20",
        amount: 10,
        operation_type: "income",
        category: "others",
        business_type: "B2C",
      },
    ]);

    expect(formatPeriodLabel(points)).toBe("Jan 2024 – Mar 2025");
  });

  it("uses a single month when all data falls in one month", () => {
    expect(formatPeriodLabel(computeMonthlyData(sampleMovements.slice(0, 2)))).toBe(
      "Jan 2024",
    );
  });

  it("falls back to a generic label without data", () => {
    expect(formatPeriodLabel([])).toBe("Last 12 months");
  });
});

describe("formatters", () => {
  it("formats currency without decimals", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("formats percent with one decimal", () => {
    expect(formatPercent(15.555)).toBe("15.6%");
  });
});
