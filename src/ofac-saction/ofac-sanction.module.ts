import { Module } from '@nestjs/common';
import { OfacSanctionService } from './ofac-sanction.service';
import { OfacSanctionController } from './ofac-sanction.controller';

@Module({
  imports: [],
  controllers: [OfacSanctionController],
  providers: [OfacSanctionService],
})
export class OfacSanctionModule {}
