import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Flavor } from "./flavor.entity";


@Entity()
export class Coffee {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    brand: string;
    @JoinTable() // specify the owner side, here Coffee own flavor
    @ManyToMany(
      type => Flavor,
      flavor => flavor.coffees,
      {
        cascade:true
      }
    )
    flavors: Flavor[];

    @Column({nullable:true})
    description: string;
    
    @Column({default:0})
    recommendations:number;
  }