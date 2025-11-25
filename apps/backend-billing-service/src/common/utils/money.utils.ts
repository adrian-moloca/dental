import Decimal from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9e15,
  toExpPos: 9e15,
  minE: -9e15,
  maxE: 9e15,
});

export class Money {
  private readonly amount: Decimal;

  constructor(amount: number | string | Decimal) {
    this.amount = new Decimal(amount);
  }

  add(other: Money): Money {
    return new Money(this.amount.plus(other.amount));
  }

  subtract(other: Money): Money {
    return new Money(this.amount.minus(other.amount));
  }

  multiply(multiplier: number | string | Decimal): Money {
    return new Money(this.amount.times(multiplier));
  }

  divide(divisor: number | string | Decimal): Money {
    return new Money(this.amount.dividedBy(divisor));
  }

  round(decimalPlaces: number = 2): Money {
    return new Money(this.amount.toDecimalPlaces(decimalPlaces));
  }

  toNumber(): number {
    return this.amount.toNumber();
  }

  toString(): string {
    return this.amount.toString();
  }

  toFixed(decimalPlaces: number = 2): string {
    return this.amount.toFixed(decimalPlaces);
  }

  isZero(): boolean {
    return this.amount.isZero();
  }

  isPositive(): boolean {
    return this.amount.isPositive();
  }

  isNegative(): boolean {
    return this.amount.isNegative();
  }

  greaterThan(other: Money): boolean {
    return this.amount.greaterThan(other.amount);
  }

  lessThan(other: Money): boolean {
    return this.amount.lessThan(other.amount);
  }

  equals(other: Money): boolean {
    return this.amount.equals(other.amount);
  }

  static zero(): Money {
    return new Money(0);
  }

  static sum(amounts: Money[]): Money {
    return amounts.reduce((acc, curr) => acc.add(curr), Money.zero());
  }
}

export function calculateTax(amount: Money, taxRate: number): Money {
  return amount.multiply(taxRate).round(2);
}

export function calculateDiscount(amount: Money, discountPercent: number): Money {
  return amount.multiply(discountPercent / 100).round(2);
}

export function applyDiscount(amount: Money, discountPercent: number): Money {
  const discount = calculateDiscount(amount, discountPercent);
  return amount.subtract(discount);
}
