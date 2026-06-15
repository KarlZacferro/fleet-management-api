import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Model } from '../models/entities/model.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let vehicleRepository: any;
  let modelRepository: any;

  const mockVehicle = { 
    id: 'uuid-123', 
    license_plate: 'ABC-1234', 
    model_id: 'model-123',
    model: { id: 'model-123', name: 'Golf', brand: { id: 'brand-123', name: 'Volkswagen' } }
  };
  const mockModel = { id: 'model-123', name: 'Golf' };

  const mockVehicleRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn().mockReturnValue(mockVehicle),
    save: jest.fn(),
    merge: jest.fn().mockImplementation((entity, dto) => ({ ...entity, ...dto })),
    remove: jest.fn(),
  };

  const mockModelRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        { provide: getRepositoryToken(Vehicle), useValue: mockVehicleRepository },
        { provide: getRepositoryToken(Model), useValue: mockModelRepository },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    vehicleRepository = module.get(getRepositoryToken(Vehicle));
    modelRepository = module.get(getRepositoryToken(Model));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new vehicle', async () => {
      const dto = { license_plate: 'ABC-1234', model_id: 'model-123' } as any;
      modelRepository.findOne.mockResolvedValue(mockModel);
      vehicleRepository.findOne.mockResolvedValue(null);
      vehicleRepository.save.mockResolvedValue(mockVehicle);
      
      const result = await service.create(dto, 'user-123');
      expect(result).toEqual(mockVehicle);
      expect(vehicleRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if model does not exist', async () => {
      const dto = { license_plate: 'ABC-1234', model_id: 'invalid-id' } as any;
      modelRepository.findOne.mockResolvedValue(null);
      
      await expect(service.create(dto, 'user-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all vehicles', async () => {
      vehicleRepository.find.mockResolvedValue([mockVehicle]);
      const result = await service.findAll();
      expect(result).toEqual([mockVehicle]);
      expect(vehicleRepository.find).toHaveBeenCalledWith({
        relations: { model: { brand: true } }
      });
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by ID', async () => {
      vehicleRepository.findOne.mockResolvedValue(mockVehicle);
      const result = await service.findOne('uuid-123');
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      vehicleRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a vehicle', async () => {
      const dto = { license_plate: 'XYZ-9999' } as any;
      vehicleRepository.findOne.mockResolvedValue(mockVehicle);
      vehicleRepository.save.mockResolvedValue({ ...mockVehicle, ...dto });
      
      const result = await service.update('uuid-123', dto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a vehicle', async () => {
      vehicleRepository.findOne.mockResolvedValue(mockVehicle);
      vehicleRepository.remove.mockResolvedValue(undefined);
      
      await service.remove('uuid-123');
      expect(vehicleRepository.remove).toHaveBeenCalled();
    });
  });
});
