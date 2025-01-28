import { Injectable } from '@nestjs/common';
import { DatasetRepository } from './dataset.repository';

@Injectable()
export class DatasetService {
  constructor(private datasetRepository: DatasetRepository) {}

  getAll() {
    return this.datasetRepository.find();
  }
}
