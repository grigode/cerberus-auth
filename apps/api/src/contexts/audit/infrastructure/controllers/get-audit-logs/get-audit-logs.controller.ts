import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleVo } from '@core/domain';
import type { Controller as BaseController } from '@core/shared-server';
import { Roles } from '../../../../iam/infrastructure/http/decorators/roles.decorator';
import type { GetAuditLogsDto } from '../../../application';
// biome-ignore lint/style/useImportType: Needed as runtime value for NestJS DI metadata
import { GetAuditLogsUseCase } from '../../../application';

@ApiTags('Audit')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Roles(RoleVo.ADMIN)
@Controller('audit')
export class GetAuditLogsController
  implements BaseController<GetAuditLogsDto, unknown>
{
  constructor(private readonly getAuditLogsUseCase: GetAuditLogsUseCase) {}

  @ApiOperation({
    summary: 'Query audit logs (Admin only)',
    description:
      'Retrieves paginated audit events with optional filtering by user, action, category, or status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated audit logs returned successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied: requires ADMIN role or higher',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async handle(@Query() query: GetAuditLogsDto) {
    return this.getAuditLogsUseCase.execute(query);
  }
}
