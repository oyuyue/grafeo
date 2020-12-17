export default class {
  private a: number;
  private b: string;

  constructor(a: number, b: string) {
    this.a = a;
    this.b = b;
  }

  getA(): number {
    return this.a;
  }

  getB(): string {
    return this.b;
  }
}
