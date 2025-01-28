import { Controller, Get } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('sanctions')
export class SanctionController {
  constructor(
    @InjectQueue('sanction-queue') private readonly sanctionQueue: Queue,
  ) {}

  @Get('sync')
  syncSanctions() {
    return this.sanctionQueue.add('sync-sanction');
  }
}
