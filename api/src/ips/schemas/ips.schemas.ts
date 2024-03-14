export class Ip {
  ip: string;
  description: string;
  isActive: boolean;

  constructor(ip: string, description: string, isActive: boolean) { // Atualização do construtor
    this.ip = ip;
    this.description = description;
    this.isActive = isActive;
  }
}
