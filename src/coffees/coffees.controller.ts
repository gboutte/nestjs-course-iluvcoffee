import { Body, Controller, Delete, Get, HttpException, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Controller('coffees')
export class CoffeesController {
    constructor(private readonly coffeesService: CoffeesService) {}
    @Get()
    findAll(@Query() paginationQuery:PaginationQueryDto) {
      // const { limit, offset } = paginationQuery;
      return this.coffeesService.findAll(paginationQuery);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      let coffee = this.coffeesService.findOne(id);
      if(!coffee){
        throw new NotFoundException(`Coffee #${id} not found`);
      }
      return coffee
    }
  
    @Post()
    create(@Body() createCoffeeDto:CreateCoffeeDto) {
      return this.coffeesService.create(createCoffeeDto);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCoffeeDto:UpdateCoffeeDto) {
      return this.coffeesService.update(id, updateCoffeeDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.coffeesService.remove(id);
    }
}
