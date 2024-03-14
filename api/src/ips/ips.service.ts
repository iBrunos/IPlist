import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDto } from './dto/create-ips.dto';
import { UpdateDto } from './dto/update-ips.dto';
import * as fs from 'fs';

export interface Ip {
  ip: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

@Injectable()
export class IpsService {
  private readonly filePath: string = '../api/data/test.txt';

  async findAll(): Promise<Ip[]> {
    const ipsData = await this.readFile();
    const ips: Ip[] = JSON.parse(ipsData);
    return ips;
  };

  async create(createDto: CreateDto): Promise<{ message: string, createdIp: Ip }> {
    const ips = await this.findAll();
    const newIp: Ip = {
      ip: createDto.ip,
      description: createDto.description,
      isActive: createDto.isActive,
      createdAt: new Date().toISOString(), // Convertido para string no formato ISO
      updatedAt: null, // Definindo como null inicialmente
    };
    ips.push(newIp);
    await this.writeFile(JSON.stringify(ips));
    return { message: 'Ip created successfully', createdIp: newIp };
  }

  async updateById(id: string, updatedIp: UpdateDto): Promise<{ message: string, updatedIp: Ip }> {
    const ips = await this.findAll();
    const index = ips.findIndex(item => item.ip === id);
    if (index === -1) {
      throw new NotFoundException('Ip not found');
    }
    // Atualizar os campos do IP com base nos valores fornecidos em updatedIp
    ips[index].ip = updatedIp.ip;
    ips[index].description = updatedIp.description;
    ips[index].isActive = updatedIp.isActive;
    ips[index].updatedAt = new Date().toISOString(); // Atualizando a data de modificação
    await this.writeFile(JSON.stringify(ips));
    return { message: 'Ip updated successfully', updatedIp: ips[index] }; // Retornando o IP atualizado
  }
  


  async deleteById(id: string): Promise<{ message: string, deletedIp: Ip }> {
    const ips = await this.findAll();
    const index = ips.findIndex(item => item.ip === id);
    if (index === -1) {
      throw new NotFoundException('Ip not found');
    }
    const deletedItem = ips.splice(index, 1)[0];
    await this.writeFile(JSON.stringify(ips));
    return { message: 'Ip deleted successfully', deletedIp: deletedItem };
  }

  private async readFile(): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private async writeFile(content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.filePath, content, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
