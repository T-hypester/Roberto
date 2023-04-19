class Battery {
  robot: any;

  capacity: number;
  charge = 0;

  constructor(props: { capacity: number }) {
    Object.assign(this, props);
  }

  use(amt = 0.1) {
    if (this.charge <= 0) {
      const roberto = document.getElementById("roberto");
      roberto.classList.add("battery");
      this.robot.emote("X(");
      throw new Error("No battery! X(");
    }
    this.charge = Math.max(this.charge - amt, 0);
  }
}
