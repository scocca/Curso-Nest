import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel:Model<Pokemon>,){}

  async create(createPokemonDto: CreatePokemonDto) {
    try{
    const pokemon = await this.pokemonModel.create(createPokemonDto)
    return pokemon;
    }catch(error){
    this.handleExceptions(error)
  }
}

  async findAll() {
    // let pokemon: Pokemon[] = await this.pokemonModel.call
  }

  async findOne(id: string) {
    let pokemon:Pokemon;

    if(!isNaN(+id)){
      pokemon = await this.pokemonModel.findOne({no:id})
    }

    if(!pokemon && isValidObjectId(id)){
      pokemon = await this.pokemonModel.findById(id)
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name:id.toLowerCase().trim()})
    }


    if(!pokemon) throw new NotFoundException(`Pokemon id ${id}, not found`)
    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id)
    try{
      if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    
      await pokemon.updateOne(updatePokemonDto);
    
      return {...pokemon.toJSON(), ...updatePokemonDto};
    }catch(error){
      this.handleExceptions(error)
  }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id)
    // await pokemon.deleteOne()
    // return `${id} pokemon deleted`;
    // const result = await this.pokemonModel.findByIdAndDelete(id)

    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id})
    if(deletedCount===0)throw new BadRequestException(`Pokemon with ${id}, not found`)
    return
  }

  private handleExceptions(error:any){
    if(error.code ===11000)
      { throw new BadRequestException(`Pokemon already exist in db ${JSON.stringify(error.keyValue)}`)}
    throw new InternalServerErrorException(`Can't create pokemon please check server logs`)
  }
}
