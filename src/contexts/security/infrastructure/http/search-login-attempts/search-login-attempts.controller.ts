import { Controller, Get, Query } from '@nestjs/common';
import { type SearchLoginAttemptUseCase } from 'src/contexts/security/application';
import { PaginatedHttpResponsePresenter } from 'src/contexts/shared/infrastructure/presenters/http/paginated-http-response.presenter';

import { SearchLoginAttemptQueryDto } from './search-login-attempts.dto';
import { SearchLoginAttemptsMapper } from './search-login-attempts.mapper';

@Controller('security')
export class SearchLoginAttemptsController {
  constructor(private readonly useCase: SearchLoginAttemptUseCase) {}

  @Get('login-attempts')
  async run(@Query() query: SearchLoginAttemptQueryDto) {
    const data = await this.useCase.execute(
      SearchLoginAttemptsMapper.toInput(query),
    );

    return PaginatedHttpResponsePresenter.present(data);
  }
}
