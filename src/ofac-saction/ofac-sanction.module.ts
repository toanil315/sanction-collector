import { Module } from '@nestjs/common';
import { OfacSanctionService } from './ofac-sanction.service';
import { OfacSanctionController } from './ofac-sanction.controller';
import { OfacSanctionProcessor } from './ofac-ftm-sanction.mapping';

@Module({
  imports: [],
  controllers: [OfacSanctionController],
  providers: [OfacSanctionService, OfacSanctionProcessor],
})
export class OfacSanctionModule {}
