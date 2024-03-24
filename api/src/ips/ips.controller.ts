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
    return this.ipsService.findAll();
  }

  @Post('/create')
  async create(@Body() createDto: CreateDto): Promise<{ message: string }> {
    return this.ipsService.create(createDto);
  }

  @Put('/:ip')
  async updateIp(
    @Param('ip') ip: string,
    @Body() updateDto: UpdateDto,
  ): Promise<{ message: string, updatedIp: Ip }> {
    return this.ipsService.updateById(ip, updateDto);
  }

  @Delete('/:ip')
  async deleteIp(@Param('ip') id: string): Promise<{ message: string }> {
    return this.ipsService.deleteById(id);
  }
}