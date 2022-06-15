import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {

      constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRepository: Repository<Coffee>,
      ) {}
    
      /**
       * Return all coffees from the database respository
       * @returns Coffee[]
       */
      findAll() {
        return this.coffeeRepository.find({
          relations:{
            flavors:true
          }
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
      create(createCoffeeDto: CreateCoffeeDto) {
        const coffee = this.coffeeRepository.create(createCoffeeDto);
        return this.coffeeRepository.save(coffee);
      }
    
      /**
       * Update a coffee inside the database
       * @param id The id of the coffee to update
       * @param updateCoffeeDto The data to apply on the object
       * @returns Coffee
       */
      async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
        const coffee = await this.coffeeRepository.preload({
          id: +id,
          ...updateCoffeeDto,
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
}
