import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AuditAction,
  type Controller as BaseController,
} from '@core/shared-server';

import type { GeneratePresignedUploadUrlUseCase } from '../../../application';
import { PresignedUploadUrlResponseDto } from './presigned-upload-url-response.dto';
import type { RequestPresignedUploadUrlDto } from './request-presigned-upload-url.dto';

@ApiTags('Storage')
@Controller('storage')
export class GeneratePresignedUploadUrlController
  implements
    BaseController<RequestPresignedUploadUrlDto, PresignedUploadUrlResponseDto>
{
  constructor(
    private readonly generatePresignedUploadUrlUseCase: GeneratePresignedUploadUrlUseCase,
  ) {}

  @ApiOperation({
    summary: 'Generate presigned URL for direct S3 upload',
    description:
      'Returns a temporary S3 presigned PUT URL enabling client-side direct S3 file uploads.',
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned upload URL generated successfully',
    type: PresignedUploadUrlResponseDto,
  })
  @AuditAction({
    action: 'GENERATE_PRESIGNED_UPLOAD_URL',
    category: 'STORAGE',
    entityName: 'File',
  })
  @Post('presigned-upload-url')
  @HttpCode(HttpStatus.OK)
  handle(
    @Body() dto: RequestPresignedUploadUrlDto,
  ): Promise<PresignedUploadUrlResponseDto> {
    return this.generatePresignedUploadUrlUseCase.execute(dto);
  }
}
