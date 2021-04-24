import type { TData, TDataRow } from '../pages/index';

interface CalculationRow {
  description: string;
  ounces: number;
  avgPrice: number;
}

export type Calculation = Array<CalculationRow>;

export default function useCalculator() {
  return (data: TData): Calculation => {
    const descriptions = data.map((row) => row[0]);
    const categories: Record<string, Array<TDataRow>> = {};
    let calculations: Calculation = [];
    let overallCost = 0;
    let overallOunces = 0;

    descriptions.forEach(desc => categories[desc] = []);
    data.forEach(row => categories[row[0]].push(row));

    Object.keys(categories).forEach(key => {
      const totalCost = categories[key].reduce((a, e) => a + e[2], 0);
      const totalOunces = categories[key].reduce((a, e) => a + e[1], 0);

      overallCost += totalCost;
      overallOunces += totalOunces;

      calculations.push({
        description: key,
        ounces: totalOunces,
        avgPrice: totalCost / totalOunces
      });
    });

    calculations = calculations.sort((a, b) => {
      const aDesc = a.description.toLowerCase();
      const bDesc = b.description.toLowerCase();

      return aDesc > bDesc
        ? 1
        : aDesc < bDesc
        ? -1
        : 0;
    });

    if (overallCost > 0 || overallOunces > 0) {
      calculations.push({
        description: "Total",
        ounces: overallOunces,
        avgPrice: overallCost / overallOunces
      });
    }

    return calculations;
  };
}
