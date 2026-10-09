# Product context

## Who it's for

An executive or business owner who wants a quick overview of financial health without digging into transactions.

## What the user sees (top to bottom)

1. **Header**: "Financial Overview / Executive metrics dashboard" + a period badge.
2. **KPI row** (4 cards): Total Income, Total Outcome, Profit (income − outcome), Profit Margin (profit / income × 100, or 0 when income is 0).
3. **Charts** (2 cards):
   - *Income vs. Outcome*: monthly lines.
   - *Profit Margin %*: monthly line with a 0 % reference line.

Loading shows skeletons. Fetch failure shows a red banner in Spanish ("No se pudo cargar la informacion financiera…") while the rest of the page still renders.

## Domain vocabulary

| Term             | Meaning                                                                 |
| ---------------- | ----------------------------------------------------------------------- |
| movement         | One financial transaction (`FinancialMovement`)                         |
| income / outcome | `operation_type`. "Outcome" means expense (project wording, keep it)    |
| category         | `sales`, `others` (income); `suppliers`, `operational`, `administrative`, `others` (outcome) |
| business type    | `B2B` or `B2C` customer segment                                         |
| net              | income − outcome for a period                                           |
| profit margin    | net / income × 100                                                      |
| alert            | a period whose outcome exceeds the running average of previous periods by more than `threshold` |

## UX language

UI copy is in English, except the fetch error message (Spanish). Keep new copy in English unless asked otherwise.
