import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDto } from './dto/create-ips.dto';
import { UpdateDto } from './dto/update-ips.dto';
import * as fs from 'fs';
import * as ftp from 'basic-ftp'; // Importe a biblioteca FTP, por exemplo

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
  private readonly filePathData: string = '../api/data/data.txt';

  async findAll(): Promise<Ip[]> {
    const ipsData = await this.readFile();
    const ips: Ip[] = JSON.parse(ipsData);
    return ips;
  };

  async create(createDto: CreateDto): Promise<{ message: string, createdIp: Ip }> {
    const ips = await this.findAll();
    const newIp: Ip = {
      ip: createDto.ip.replace(/\\\\/g, '\\'), // Garante que apenas uma barra invertida seja passada
      description: createDto.description,
      isActive: createDto.isActive,
      createdAt: new Date().toISOString(), // Convertido para string no formato ISO
      updatedAt: null, // Definindo como null inicialmente
    };
    ips.push(newIp);
    await this.writeFile(ips); // Passa o array de IPs diretamente para o método writeFile
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
    await this.writeFile(ips); // Passa o array de IPs diretamente para o método writeFile
    return { message: 'Ip updated successfully', updatedIp: ips[index] }; // Retornando o IP atualizado
  }

  async deleteById(id: string): Promise<{ message: string, deletedIp: Ip }> {
    const ips = await this.findAll();
    const index = ips.findIndex(item => item.ip === id);
    if (index === -1) {
      throw new NotFoundException('Ip not found');
    }
    const deletedItem = ips.splice(index, 1)[0];
    await this.writeFile(ips); // Passa o array de IPs diretamente para o método writeFile
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

  private async writeFile(ips: Ip[]): Promise<void> {
    // Salvando no arquivo JSON
    const sanitizedIpsJSON = ips.map(ip => ({
      ...ip,
      ip: ip.ip.replace(/\\\\/g, '\\')
    }));
    const contentJSON = JSON.stringify(sanitizedIpsJSON, null, 2);
    fs.writeFile(this.filePath, contentJSON, (err) => {
      if (err) {''
        console.error('Error writing JSON file:', err);
      }
    });
  
    // Salvando no arquivo data.txt
    const contentTXT = ips.map(ip => `${ip.ip} #${ip.description}`).join('\n');
    return new Promise((resolve, reject) => {
      fs.writeFile(this.filePathData, contentTXT, async (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
          await this.uploadFileViaFTP(this.filePathData); // Chama a função para enviar o arquivo via FTP após escrever o arquivo data.txt
        }
      });
    });
  }


  private async uploadFileViaFTP(filePath: string): Promise<void> {
    const client = new ftp.Client();
    try {
      await client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD
      });
      await client.uploadFrom(filePath, 'data.txt');
    } catch (error) {
      console.error('Error uploading file via FTP:', error);
    }
    client.close();
}
}