import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';
import { DataSource, Repository } from 'typeorm';
import { COFFEE_BRANDS } from './coffees.constants';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

@Injectable()
export class CoffeesService {

      constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRepository: Repository<Coffee>,
        @InjectRepository(Flavor)
        private readonly flavorRepository: Repository<Flavor>,
        private readonly dataSource:DataSource,
        @Inject(COFFEE_BRANDS) coffeeBrands: string[],
        private readonly configService: ConfigService
      ) {
        const databaseHost = this.configService.get<string>('DATABASE_HOST','localhost');
        console.log(databaseHost);
      }
    
      /**
       * Return all coffees from the database respository
       * @returns Coffee[]
       */
       findAll(paginationQuery: PaginationQueryDto) {
        const { limit, offset } = paginationQuery;
        return this.coffeeRepository.find({
          relations: {
            flavors: true,
          },
          skip: offset, 
          take: limit,
        });
      }

      /**
       * Return on coffee from database
       * @param id The id of the coffee
       * @returns Coffee
       */
      async findOne(id: string) {
        const coffee = await this.coffeeRepository.findOne({ 
          where: {
             id: +id 
            },
          relations:{
            flavors:true
          } 
        });
        if (!coffee) {
          throw new NotFoundException(`Coffee #${id} not found`);
        }
        return coffee;
      }
    
      /**
       * Create a new Coffee inside database
       * @param createCoffeeDto the Object that represent the coffee that will be created inside database
       * @returns Coffee
       */
       async create(createCoffeeDto: CreateCoffeeDto) {

        // Loading all flavors to add them later inside the coffee
        // If they doesn't exist they will be created by the preloadFlavorByName method
        const flavors = await Promise.all(
          createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)),
        );
    
        const coffee = this.coffeeRepository.create({
          ...createCoffeeDto,
          flavors, 
        });
        return this.coffeeRepository.save(coffee);
      }
    
      /**
       * Update a coffee inside the database
       * @param id The id of the coffee to update
       * @param updateCoffeeDto The data to apply on the object
       * @returns Coffee
       */
       async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {

        // Loading all flavors if defined inside DTO
        // Not found flavors will be created by preloadFlavorByName method
        const flavors =
          updateCoffeeDto.flavors &&
          (await Promise.all(
            updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)),
          ));
    
        const coffee = await this.coffeeRepository.preload({
          id: +id,
          ...updateCoffeeDto,
          flavors, // Flavors added to the patch
        });
        if (!coffee) {
          throw new NotFoundException(`Coffee #${id} not found`);
        }
        return this.coffeeRepository.save(coffee);
      }
    
    
      /**
       * Delete a row of coffee inside the database
       * @param id The id of the row to delete
       * @returns Coffee
       */
      async remove(id: string) {
        const coffee = await this.findOne(id);
        return this.coffeeRepository.remove(coffee);
      }

      /**
       * It find the flavor by its name, if it doesn't exist it create it
       * @param name the name of the flavor
       * @returns Flavor
       */
      private async preloadFlavorByName(name: string): Promise<Flavor> {
        //Looking for the flavor inside the database
        const existingFlavor = await this.flavorRepository.findOne({ where: {
          name
         }, });

         //If found return it
        if (existingFlavor) {
          return existingFlavor;
        }
        // If not found then create it and return it
        return this.flavorRepository.create({ name });
      }

      async recommendCoffee(coffee:Coffee){
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          coffee.recommendations++;
    
          const recommendEvent = new Event();
          recommendEvent.name = 'recommend_coffee';
          recommendEvent.type = 'coffee';
          recommendEvent.payload = { coffeeId: coffee.id };
        
          await queryRunner.manager.save(coffee); 
          await queryRunner.manager.save(recommendEvent);

          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
        } finally{
          await queryRunner.release();
        }
      }
}
