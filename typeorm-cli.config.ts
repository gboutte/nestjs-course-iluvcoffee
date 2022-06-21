import { Coffee } from "src/coffees/entities/coffee.entity";
import { Flavor } from "src/coffees/entities/flavor.entity";
import { CoffeeRefactor1655755477755 } from "src/migrations/1655755477755-CoffeeRefactor";
import { DataSource } from "typeorm";

export default new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5566,
    username: 'postgres',
    password: 'pass123',
    database: 'postgres',
    entities: [Coffee,Flavor],
    migrations: [CoffeeRefactor1655755477755],
  });