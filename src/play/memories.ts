class Ram {
  readonly size: number = 8;

  constructor(props: { size: number }) {
    this.size = Math.min(48, Math.max(8, props.size));
  }
}
