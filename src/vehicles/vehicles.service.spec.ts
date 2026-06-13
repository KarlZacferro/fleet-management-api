import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Model } from '../models/entities/model.entity'; // Certifique-se que o caminho está correto
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repository: any;
  let modelRepository: any;
  let cacheManager: any;

  const mockVehicle = { id: 'uuid-123', license_plate: 'ABC-1234', model_id: 'model-123' };
  const mockModel = { id: 'model-123', name: 'Sedan' };

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn().mockReturnValue(mockVehicle),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockModelRepository = {
    findOne: jest.fn().mockResolvedValue(mockModel),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(3600),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        { provide: getRepositoryToken(Vehicle), useValue: mockRepository },
        { provide: getRepositoryToken(Model), useValue: mockModelRepository }, // ADICIONADO
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    repository = module.get(getRepositoryToken(Vehicle));
    modelRepository = module.get(getRepositoryToken(Model));
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ... (os outros testes de create, findAll, etc, permanecem os mesmos)
  describe('create', () => {
    it('should create a new vehicle', async () => {
      const dto = { license_plate: 'ABC-1234', model_id: 'model-123' } as any;
      repository.save.mockResolvedValue(mockVehicle);
      
      const result = await service.create(dto, 'user-123');
      expect(result).toEqual(mockVehicle);
      expect(cacheManager.del).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return vehicles from cache if available', async () => {
      cacheManager.get.mockResolvedValue([mockVehicle]);
      const result = await service.findAll();
      expect(result).toEqual([mockVehicle]);
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by ID', async () => {
      repository.findOne.mockResolvedValue(mockVehicle);
      const result = await service.findOne('uuid-123');
      expect(result).toEqual(mockVehicle);
    });
  });
});
