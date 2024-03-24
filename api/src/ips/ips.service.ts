import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDto } from './dto/create-ips.dto';
import { UpdateDto } from './dto/update-ips.dto';
import * as fs from 'fs';
import * as Client from 'ssh2-sftp-client';

export interface Ip {
  ip: string;
  description: string;
  disabled: boolean;
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
  }

  async create(createDto: CreateDto): Promise<{ message: string; createdIp: Ip }> {
    const ips = await this.findAll();
    const newIp: Ip = {
      ip: createDto.ip.replace(/\\\\/g, '\\'),
      description: createDto.description,
      disabled: createDto.disabled,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    ips.push(newIp);
    await this.writeFile(ips);
    return { message: 'Ip criado com sucesso', createdIp: newIp };
  }

  async updateById(id: string, updatedIp: UpdateDto): Promise<{ message: string; updatedIp: Ip }> {
    const ips = await this.findAll();
    const index = ips.findIndex(item => item.ip === id);
    
    if (index === -1) {
      throw new NotFoundException('Ip não encontrado');
    }
    
    ips[index].description = updatedIp.description;
    ips[index].disabled = updatedIp.disabled;
    ips[index].updatedAt = new Date().toISOString();
  
    // Não é necessário adicionar ou remover '#' aqui, pois a lógica está na função writeFile
    
    await this.writeFile(ips);
    
    return { message: 'Ip atualizado com sucesso', updatedIp: ips[index] };
  }
  
  async deleteById(id: string): Promise<{ message: string; deletedIp: Ip }> {
    const ips = await this.findAll();
    const index = ips.findIndex(item => item.ip === id);
    if (index === -1) {
      throw new NotFoundException('Ip não encontrado');
    }
    const deletedItem = ips.splice(index, 1)[0];
    await this.writeFile(ips);
    return { message: 'Ip deletado com sucesso', deletedIp: deletedItem };
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
    const sanitizedIpsJSON = ips.map(ip => ({
      ...ip,
      ip: ip.ip.replace(/\\\\/g, '\\'),
    }));
    const contentJSON = JSON.stringify(sanitizedIpsJSON, null, 2);
    fs.writeFile(this.filePath, contentJSON, (err) => {
      if (err) {
        console.error('Erro ao escrever no arquivo JSON:', err);
      }
    });
  
    const contentTXT = ips.map(ip => {
      let ipLine = ip.ip;
      if (ip.disabled) {
        // Adiciona '#' somente se não estiver presente no início do IP
        ipLine = ipLine.startsWith('#') ? ipLine : `#${ipLine}`;
      } else {
        // Remove '#' somente se estiver presente no início do IP
        ipLine = ipLine.startsWith('#') ? ipLine.slice(1) : ipLine;
      }
      return `${ipLine} #${ip.description}`;
    }).join('\n');
  
    return new Promise((resolve, reject) => {
      fs.writeFile(this.filePathData, contentTXT, async (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
          await this.uploadFileViaSFTP(this.filePathData); // Alterado para chamar a função de upload via SFTP
        }
      });
    });
  }
  

  private async uploadFileViaSFTP(filePath: string): Promise<void> {
    const sftp = new Client();
    try {
      await sftp.connect({
        host: process.env.SFTP_HOST,
        port: parseInt(process.env.SFTP_PORT),
        username: process.env.SFTP_USER,
        password: process.env.SFTP_PASSWORD,
      });
      await sftp.put(filePath, 'data.txt'); // Envio do arquivo via SFTP
    } catch (error) {
      console.error('Erro ao enviar arquivo via SFTP:', error);
    } finally {
      sftp.end(); // Encerramento da conexão SFTP
    }
  }
}