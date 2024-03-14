import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { IpsService } from './ips.service';
import { CreateDto } from './dto/create-ips.dto';
import { UpdateDto } from './dto/update-ips.dto';
import { Ip } from './ips.service'; // Importe o tipo Ip daqui

@Controller('/ips')
export class IpsController {
  constructor(private readonly ipsService: IpsService) {}

  @Get()
  async getAllIps(): Promise<any[]> {
    return this.ipsService.findAll(); // Você precisará implementar este método no serviço
  }

  @Post('/create')
  async create(@Body() createDto: CreateDto): Promise<{ message: string }> {
    return this.ipsService.create(createDto); // Você precisará implementar este método no serviço
  }

  @Put('/:ip')
  async updateIp(
    @Param('ip') ip: string,
    @Body() updateDto: UpdateDto,
  ): Promise<{ message: string, updatedIp: Ip }> {
    return this.ipsService.updateById(ip, updateDto);
  }

  @Delete('/:id')
  async deleteIp(@Param('id') id: string): Promise<{ message: string }> {
    return this.ipsService.deleteById(id); // Você precisará implementar este método no serviço
  }
}