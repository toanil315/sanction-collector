import { Controller, Get, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DatasetService } from './dataset.service';

@Controller('open-sanction/datasets')
export class DatasetController {
  constructor(
    @InjectQueue('dataset-queue') private readonly datasetQueue: Queue,
    private datasetService: DatasetService,
  ) {}

  @Get()
  getDatasets() {
    return this.datasetService.getAll();
  }

  @Get('sync')
  syncDatasets() {
    return this.datasetQueue.add('sync-dataset');
  }
}
