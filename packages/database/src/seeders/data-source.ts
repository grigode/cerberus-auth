import * as path from 'node:path';
import { DatabaseConfigService } from '@core/config';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { entities } from '../database.provider';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

const configService = new DatabaseConfigService(new ConfigService());
const config = configService.MAIN_DATABASE_SOURCE;

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  entities,
  migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
  synchronize: config.synchronize,
  logging: true,
});

export default AppDataSource;
