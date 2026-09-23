import { BadRequestException, Controller, Post, Req } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuditAction,
  type Controller as BaseController,
} from '@core/shared-server';
import type { FastifyRequest } from 'fastify';

import type { UploadFileUseCase } from '../../../application';
import { StorageFileResponseDto } from './storage-file-response.dto';

interface MultipartFile {
  filename: string;
  mimetype: string;
  toBuffer: () => Promise<Buffer>;
}

@ApiTags('Storage')
@Controller('storage')
export class UploadFileController
  implements BaseController<FastifyRequest, StorageFileResponseDto>
{
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

  @ApiOperation({
    summary: 'Upload file directly to S3 storage via backend',
    description:
      'Receives a file via multipart form-data and saves it to S3 compatible storage.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        path: {
          type: 'string',
          description: 'Optional destination subfolder',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: StorageFileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No file provided or invalid request',
  })
  @AuditAction({
    action: 'UPLOAD_FILE',
    category: 'STORAGE',
    entityName: 'File',
  })
  @Post('upload')
  async handle(@Req() req: FastifyRequest): Promise<StorageFileResponseDto> {
    if (
      typeof (req as unknown as Record<string, unknown>).file !== 'function'
    ) {
      throw new BadRequestException(
        'Multipart requests are not properly initialized',
      );
    }

    const data = await (
      req as unknown as { file: () => Promise<MultipartFile | undefined> }
    ).file();

    if (!data) {
      throw new BadRequestException('No file provided in request');
    }

    const buffer = await data.toBuffer();
    const queryPath = (req.query as Record<string, string> | undefined)?.path;

    const result = await this.uploadFileUseCase.execute(
      {
        originalname: data.filename,
        mimetype: data.mimetype,
        buffer,
      },
      { path: queryPath },
    );

    return StorageFileResponseDto.fromDomain(result);
  }
}
