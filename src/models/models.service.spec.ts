import { Test, TestingModule } from '@nestjs/testing';
import { ModelsService } from './models.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Model } from './entities/model.entity';
import { Brand } from '../brands/entities/brand.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ModelsService', () => {
  let service: ModelsService;
  let modelRepo: any;
  let brandRepo: any;

  const mockModel = { id: 'm1', name: 'Golf', brand_id: 'b1' };
  const mockBrand = { id: 'b1', name: 'VW' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelsService,
        { provide: getRepositoryToken(Model), useValue: { 
          create: jest.fn().mockReturnValue(mockModel),
          save: jest.fn().mockResolvedValue(mockModel),
          find: jest.fn().mockResolvedValue([mockModel]),
          findOne: jest.fn(),
          merge: jest.fn().mockReturnValue(mockModel),
          remove: jest.fn().mockResolvedValue(undefined),
        }},
        { provide: getRepositoryToken(Brand), useValue: { findOne: jest.fn() }},
      ],
    }).compile();

    service = module.get<ModelsService>(ModelsService);
    modelRepo = module.get(getRepositoryToken(Model));
    brandRepo = module.get(getRepositoryToken(Brand));
  });

  describe('create', () => {
    it('should create a model if brand exists', async () => {
      brandRepo.findOne.mockResolvedValue(mockBrand);
      expect(await service.create({ name: 'Golf', brand_id: 'b1' } as any, 'u1')).toEqual(mockModel);
    });

    it('should throw BadRequest if brand does not exist', async () => {
      brandRepo.findOne.mockResolvedValue(null);
      await expect(service.create({ brand_id: 'invalid' } as any, 'u1')).rejects.toThrow(BadRequestException);
    });
  });
});
