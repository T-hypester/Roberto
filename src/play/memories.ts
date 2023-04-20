class Ram {
  readonly size: number = 8;

  constructor(props: { size: number }) {
    this.size = Math.max(48, Math.max(8, props.size));
  }
}
