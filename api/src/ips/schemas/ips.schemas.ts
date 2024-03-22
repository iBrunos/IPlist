export class Ip {
  ip: string;
  description: string;
  disabled: boolean;

  constructor(ip: string, description: string, disabled: boolean) { // Atualização do construtor
    this.ip = ip;
    this.description = description;
    this.disabled = disabled;
  }
}
