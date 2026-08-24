import { DatabaseConfigService } from '@core/config';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

const configService = new DatabaseConfigService(new ConfigService());
const config = configService.MAIN_DATABASE_SOURCE;

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  entities: [`${__dirname}/../../**/*.typeorm.entity{.ts,.js}`],
  migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
  synchronize: config.synchronize,
  logging: true,
});

export default AppDataSource;
