import { DataSource, DataSourceOptions } from 'typeorm';

require('dotenv').config();

const config: DataSourceOptions = {
    type: 'postgres',
    synchronize: false,
    entities: [__dirname + '/../app/**/*.entity{.ts,.js}'],
    url: process.env.DATABASE_URL,
};
console.log(JSON.stringify(config, null, 4));
const datasource = new DataSource(config);

datasource.initialize();
export default datasource; 
