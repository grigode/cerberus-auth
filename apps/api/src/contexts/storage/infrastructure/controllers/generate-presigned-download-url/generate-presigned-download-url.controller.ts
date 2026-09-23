import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AuditAction,
  type Controller as BaseController,
} from '@core/shared-server';

import type { GeneratePresignedDownloadUrlUseCase } from '../../../application';
import { PresignedDownloadUrlResponseDto } from './presigned-download-url-response.dto';

@ApiTags('Storage')
@Controller('storage')
export class GeneratePresignedDownloadUrlController
  implements BaseController<string, PresignedDownloadUrlResponseDto>
{
  constructor(
    private readonly generatePresignedDownloadUrlUseCase: GeneratePresignedDownloadUrlUseCase,
  ) {}

  @ApiOperation({
    summary: 'Generate presigned URL for secure file download',
    description:
      'Returns a temporary presigned GET URL allowing clients to download private S3 files.',
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned download URL generated successfully',
    type: PresignedDownloadUrlResponseDto,
  })
  @AuditAction({
    action: 'GENERATE_PRESIGNED_DOWNLOAD_URL',
    category: 'STORAGE',
    entityName: 'File',
  })
  @Get('presigned-download-url')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Query('fileKey') fileKey: string,
  ): Promise<PresignedDownloadUrlResponseDto> {
    const downloadUrl =
      await this.generatePresignedDownloadUrlUseCase.execute(fileKey);
    return { downloadUrl };
  }
}
