import { Controller, Get, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('eu-sanction/sanctions')
export class EuSanctionController {
  constructor(
    @InjectQueue('eu-sanction-queue') private readonly euSanctionQueue: Queue,
  ) {}

  @Get('sync')
  syncDatasets() {
    return this.euSanctionQueue.add('sync-sanction');
  }
}
