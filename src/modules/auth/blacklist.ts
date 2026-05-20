export interface ITokenBlacklist {
  add(token: string): void;
  has(token: string): boolean;
}

export class InMemoryTokenBlacklist implements ITokenBlacklist {
  private tokens: Set<string> = new Set();
  add(token: string): void { this.tokens.add(token); }
  has(token: string): boolean { return this.tokens.has(token); }
}
