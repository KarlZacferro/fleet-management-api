import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Request, ParseUUIDPipe 
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('vehicles')
@UseGuards(AuthGuard('jwt'))
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  async create(@Body() createVehicleDto: CreateVehicleDto, @Request() req: any) {
    // pega o  ID do usuário que está logado (extraído do Token JWT)
    const userId = req.user.userId || req.user.id; 
    return this.vehiclesService.create(createVehicleDto, userId);
  }

  @Get()
  async findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  // ParseUUIDPipe sem o 'new' para deixar o Nest gerenciar
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateVehicleDto: UpdateVehicleDto
  ) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.remove(id);
  }
}
