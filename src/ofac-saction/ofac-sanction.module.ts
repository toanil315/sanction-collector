import { Module } from '@nestjs/common';
import { OfacSanctionService } from './ofac-sanction.service';
import { OfacSanctionController } from './ofac-sanction.controller';
import { OfacSanctionDataTransformerFileSaver } from './ofac-sanction-mapper-and-saver';

@Module({
  imports: [],
  controllers: [OfacSanctionController],
  providers: [OfacSanctionService, OfacSanctionDataTransformerFileSaver],
})
export class OfacSanctionModule {}
