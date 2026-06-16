import { DomainError } from "../../shared/errors.js";

export class PositionSize {
  readonly shares: number;

  constructor(shares: number) {
    if (!Number.isInteger(shares) || shares < 0) {
      throw new DomainError("Position size must be a non-negative integer");
    }
    this.shares = shares;
  }
}
