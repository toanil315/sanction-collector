import { Controller, Get } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EuSanctionMapService } from './eu-sanction.service';

@Controller('eu-sanction/sanctions')
export class EuSanctionController {
  constructor(
    @InjectQueue('eu-sanction-queue') private readonly euSanctionQueue: Queue,
    private euSanctionService: EuSanctionMapService,
  ) {}

  @Get('sync')
  syncDatasets() {
    return this.euSanctionQueue.add('sync-sanction');
  }

  @Get()
  getSanctions() {
    return this.euSanctionService.crawData();
  }
}
