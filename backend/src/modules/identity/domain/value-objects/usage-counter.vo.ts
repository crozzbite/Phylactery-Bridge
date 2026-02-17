export class UsageCounter {
  constructor(
    private readonly currentDeliberations: number,
    private readonly monthlyLimit: number,
    private readonly tokensUsed: number,
    private readonly usageLastResetDate: Date,
  ) {}

  static create(
    currentDeliberations: number,
    monthlyLimit: number,
    tokensUsed: number,
    usageLastResetDate: Date,
  ): UsageCounter {
    return new UsageCounter(
      currentDeliberations,
      monthlyLimit,
      tokensUsed,
      usageLastResetDate,
    );
  }

  canStartNewAudit(): boolean {
    return this.currentDeliberations < this.monthlyLimit;
  }

  incrementUsage(tokens: number = 0): UsageCounter {
    return new UsageCounter(
      this.currentDeliberations + 1,
      this.monthlyLimit,
      this.tokensUsed + tokens,
      this.usageLastResetDate,
    );
  }

  get usagePercentage(): number {
    if (this.monthlyLimit === 0) return 100;
    return (this.currentDeliberations / this.monthlyLimit) * 100;
  }

  get limits(): { current: number; max: number; tokens: number } {
    return {
      current: this.currentDeliberations,
      max: this.monthlyLimit,
      tokens: this.tokensUsed,
    };
  }
}
