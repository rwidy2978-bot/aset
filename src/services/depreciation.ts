import { Asset, Category, DepreciationScheduleItem } from '../types/eams';

export class AssetDepreciationService {
  /**
   * Calculate current book value as of a given date using Straight Line depreciation
   * Formula: Annual Rate = (Cost - Residual) / UsefulLifeYears
   * Monthly Rate = DepreciableAmount / (UsefulLifeYears * 12)
   */
  static calculateMonthlyDepreciation(
    asset: Pick<Asset, 'purchase_cost' | 'residual_value' | 'purchase_date'>,
    category: Pick<Category, 'useful_life_years' | 'depreciation_method'>,
    asOfDate: Date = new Date()
  ): { currentBookValue: number; accumulatedDepreciation: number; monthsElapsed: number; monthlyRate: number } {
    const totalLifeMonths = Math.max(1, category.useful_life_years * 12);
    const depreciableAmount = Math.max(0, asset.purchase_cost - asset.residual_value);

    if (totalLifeMonths <= 0 || depreciableAmount <= 0) {
      return {
        currentBookValue: asset.purchase_cost,
        accumulatedDepreciation: 0,
        monthsElapsed: 0,
        monthlyRate: 0,
      };
    }

    const purchaseDate = new Date(asset.purchase_date);
    const diffTime = asOfDate.getTime() - purchaseDate.getTime();
    const monthsElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.4375)));

    if (category.depreciation_method === 'declining_balance') {
      // Double declining balance rate
      const annualRate = 2 / category.useful_life_years;
      const monthlyRate = annualRate / 12;
      let currentVal = asset.purchase_cost;
      for (let m = 0; m < Math.min(monthsElapsed, totalLifeMonths); m++) {
        const expense = currentVal * monthlyRate;
        if (currentVal - expense < asset.residual_value) {
          currentVal = asset.residual_value;
          break;
        }
        currentVal -= expense;
      }
      const accDep = asset.purchase_cost - currentVal;
      return {
        currentBookValue: Math.round(currentVal * 100) / 100,
        accumulatedDepreciation: Math.round(accDep * 100) / 100,
        monthsElapsed,
        monthlyRate: Math.round(monthlyRate * asset.purchase_cost * 100) / 100,
      };
    }

    // Default: Straight line
    const monthlyRate = depreciableAmount / totalLifeMonths;

    if (monthsElapsed >= totalLifeMonths) {
      return {
        currentBookValue: Number(asset.residual_value),
        accumulatedDepreciation: Number(depreciableAmount),
        monthsElapsed,
        monthlyRate: Math.round(monthlyRate * 100) / 100,
      };
    }

    const accumulatedDepreciation = monthlyRate * monthsElapsed;
    const calculatedValue = asset.purchase_cost - accumulatedDepreciation;
    const currentBookValue = Math.max(calculatedValue, asset.residual_value);

    return {
      currentBookValue: Math.round(currentBookValue * 100) / 100,
      accumulatedDepreciation: Math.round(accumulatedDepreciation * 100) / 100,
      monthsElapsed,
      monthlyRate: Math.round(monthlyRate * 100) / 100,
    };
  }

  /**
   * Generate complete month-by-month depreciation amortization schedule
   */
  static generateAmortizationSchedule(
    asset: Pick<Asset, 'purchase_cost' | 'residual_value' | 'purchase_date'>,
    category: Pick<Category, 'useful_life_years' | 'depreciation_method'>
  ): DepreciationScheduleItem[] {
    const totalMonths = category.useful_life_years * 12;
    const items: DepreciationScheduleItem[] = [];
    const purchaseDate = new Date(asset.purchase_date);

    let currentVal = asset.purchase_cost;
    let accumulated = 0;

    const depreciableAmount = Math.max(0, asset.purchase_cost - asset.residual_value);
    const monthlyStraightLine = depreciableAmount / totalMonths;
    const decliningMonthlyRate = (2 / category.useful_life_years) / 12;

    for (let m = 1; m <= totalMonths; m++) {
      const scheduleDate = new Date(purchaseDate);
      scheduleDate.setMonth(purchaseDate.getMonth() + m);
      const dateStr = scheduleDate.toISOString().split('T')[0];

      let expense = 0;
      if (category.depreciation_method === 'declining_balance') {
        expense = currentVal * decliningMonthlyRate;
        if (currentVal - expense < asset.residual_value) {
          expense = Math.max(0, currentVal - asset.residual_value);
        }
      } else {
        expense = monthlyStraightLine;
        if (currentVal - expense < asset.residual_value) {
          expense = Math.max(0, currentVal - asset.residual_value);
        }
      }

      const beginning = currentVal;
      currentVal = Math.max(asset.residual_value, currentVal - expense);
      accumulated += expense;

      items.push({
        monthIndex: m,
        date: dateStr,
        beginningValue: Math.round(beginning * 100) / 100,
        depreciationExpense: Math.round(expense * 100) / 100,
        accumulatedDepreciation: Math.round(accumulated * 100) / 100,
        endingBookValue: Math.round(currentVal * 100) / 100,
      });

      if (currentVal <= asset.residual_value) {
        break;
      }
    }

    return items;
  }
}
