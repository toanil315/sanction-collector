import { Controller, Get } from '@nestjs/common';
import { OfacSanctionService } from './ofac-sanction.service';

@Controller('ofac-sanction/sanctions')
export class OfacSanctionController {
  constructor(private readonly ofacSanctionService: OfacSanctionService) {}

  @Get()
  syncDatasets() {
    return this.ofacSanctionService.getEntities();
  }
}
