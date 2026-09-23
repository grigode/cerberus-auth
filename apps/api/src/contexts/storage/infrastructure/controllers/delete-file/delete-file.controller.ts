import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AuditAction,
  type Controller as BaseController,
} from '@core/shared-server';

import type { DeleteFileUseCase } from '../../../application';
import { DeleteFileResponseDto } from './delete-file-response.dto';

@ApiTags('Storage')
@Controller('storage')
export class DeleteFileController
  implements BaseController<string, DeleteFileResponseDto>
{
  constructor(private readonly deleteFileUseCase: DeleteFileUseCase) {}

  @ApiOperation({
    summary: 'Delete a file from S3 storage by key',
    description: 'Deletes the specified object key from S3 / MinIO storage.',
  })
  @ApiParam({
    name: 'key',
    description: 'The S3 object key to delete',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    type: DeleteFileResponseDto,
  })
  @AuditAction({
    action: 'DELETE_FILE',
    category: 'STORAGE',
    entityName: 'File',
  })
  @Delete('files/*')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('*') key: string): Promise<DeleteFileResponseDto> {
    if (!key) {
      throw new BadRequestException('File key is required');
    }

    await this.deleteFileUseCase.execute(key);

    return { message: 'File deleted successfully' };
  }
}
