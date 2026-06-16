import { DomainError } from "../../shared/errors.js";

export class RiskScore {
  readonly value: number;

  constructor(value: number) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new DomainError("Risk score must be between 0 and 100");
    }
    this.value = value;
  }
}
