import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController, Response } from '@shared/base.controller';
import { ApiOkResponse } from '@shared/decorators';
import { IBookService } from '../../domain/services/book';
import {
  mapBookToDto,
  mapDtoToBook,
} from '../../domain/mappers/book-dto.mapper';
import { BookDto, UpdateBookDto } from '../../domain/dto';

@Controller()
@ApiTags('Books')
export class BookController extends BaseController {
  constructor(@Inject(IBookService) private bookService: IBookService) {
    super();
  }

  @Get(':id')
  @ApiOkResponse(BookDto)
  async getBook(@Param('id') id: string): Promise<Response<BookDto>> {
    const book = await this.bookService.getById(id);
    return this.ok(mapBookToDto(book));
  }

  @Post()
  @ApiOkResponse(BookDto)
  async create(@Body() bookDto: BookDto): Promise<Response<BookDto>> {
    const book = await this.bookService.create(mapDtoToBook(bookDto));
    return this.ok(mapBookToDto(book));
  }

  @Patch(':id')
  @ApiOkResponse(BookDto)
  async update(
    @Param('id') id: string,
    @Body() bookDto?: UpdateBookDto,
  ): Promise<Response<BookDto>> {
    const book = await this.bookService.update(id, bookDto);
    return this.ok(mapBookToDto(book));
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Response<void>> {
    await this.bookService.delete(id);
    return this.ok();
  }
}
