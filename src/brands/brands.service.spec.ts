import { Test, TestingModule } from '@nestjs/testing';
import { BrandsService } from './brands.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { NotFoundException } from '@nestjs/common';

describe('BrandsService', () => {
  let service: BrandsService;
  let repository: any;

  const mockBrand = { id: 'uuid-brand', name: 'Volkswagen' };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockBrand),
    save: jest.fn().mockResolvedValue(mockBrand),
    find: jest.fn().mockResolvedValue([mockBrand]),
    findOne: jest.fn(),
    merge: jest.fn().mockReturnValue(mockBrand),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        { provide: getRepositoryToken(Brand), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
    repository = module.get(getRepositoryToken(Brand));
  });

  it('should create a brand', async () => {
    expect(await service.create({ name: 'Volkswagen' } as any)).toEqual(mockBrand);
  });

  it('should find all brands', async () => {
    expect(await service.findAll()).toEqual([mockBrand]);
  });

  it('should find one brand', async () => {
    repository.findOne.mockResolvedValue(mockBrand);
    expect(await service.findOne('uuid-brand')).toEqual(mockBrand);
  });

  it('should throw NotFoundException if brand not found', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });
});
