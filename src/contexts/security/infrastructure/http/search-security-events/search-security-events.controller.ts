import { Controller, Get, Query } from '@nestjs/common';
import { type SearchSecurityEventUseCase } from 'src/contexts/security/application';
import { PaginatedHttpResponsePresenter } from 'src/contexts/shared/infrastructure/presenters/http/paginated-http-response.presenter';

import { SearchSecurityEventsQueryDto } from './search-security-events.dto';
import { SearchSecurityEventsMapper } from './search-security-events.mapper';

@Controller('security')
export class SearchSecurityEventsController {
  constructor(private readonly useCase: SearchSecurityEventUseCase) {}

  @Get('security-events')
  async run(@Query() query: SearchSecurityEventsQueryDto) {
    const data = await this.useCase.execute(
      SearchSecurityEventsMapper.toInput(query),
    );

    return PaginatedHttpResponsePresenter.present(data);
  }
}
