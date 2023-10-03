let instance = 0;
class genUUID {
  private static instance: genUUID;
  private lastTimeStampStr: string;
  private lastCount: number;
  instance = this;

  constructor() {
    this.lastTimeStampStr = new Date().getTime().toString();
    this.lastCount = 0;
    // throw new Error("Error creating instance");
  }
  getInstance() {
    if (!genUUID.instance) {
      genUUID.instance = new genUUID();
    }
    return genUUID.instance;
  }
  public genUniqueId = () => {
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
    const ts = new Date().getTime().toString();
    if (ts === this.lastTimeStampStr) {
      this.lastCount += 1;
    } else {
      this.lastTimeStampStr = ts;
      this.lastCount = 0;
    }
    return uuid + "-" + ts + "-" + this.lastCount.toString();
  };
}
const singletonUUID = Object.freeze(new genUUID());
export const genUniqueId = () => {
  const uniqueId = singletonUUID.getInstance();
  return uniqueId.genUniqueId();
};
