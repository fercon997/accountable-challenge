import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  BaseController,
  Response,
  ResponsePaginated,
} from '@shared/base.controller';
import { ApiOkResponse, ApiOkResponsePaginated } from '@shared/decorators';
import { IBookService } from '../../domain/services/book';
import {
  mapBookArrayToDto,
  mapBookToDto,
  mapDtoToBook,
} from '../../domain/mappers/book-dto.mapper';
import {
  BookDto,
  CreateBookDto,
  PaginationBookDto,
  ResponseBookDto,
  UpdateBookDto,
} from '../../domain/dto';

@Controller()
@ApiTags('Books')
export class BookController extends BaseController {
  constructor(@Inject(IBookService) private bookService: IBookService) {
    super();
  }

  @Get('/search')
  @ApiOkResponsePaginated(ResponseBookDto)
  async search(
    @Query() options: PaginationBookDto,
  ): Promise<ResponsePaginated<BookDto>> {
    const { title, author, genre, page, pageSize } = options;
    const result = await this.bookService.search(
      { title, author, genre },
      { page, pageSize },
    );

    return this.okPaginated({
      ...result,
      data: mapBookArrayToDto(result.data),
    });
  }

  @Get(':id')
  @ApiOkResponse(ResponseBookDto)
  async getBook(@Param('id') id: string): Promise<Response<BookDto>> {
    const book = await this.bookService.getById(id);
    return this.ok(mapBookToDto(book));
  }

  @Post()
  @ApiOkResponse(ResponseBookDto)
  async create(@Body() bookDto: CreateBookDto): Promise<Response<BookDto>> {
    const book = await this.bookService.create(
      mapDtoToBook(bookDto),
      bookDto.quantity,
    );
    return this.ok(mapBookToDto(book));
  }

  @Patch(':id')
  @ApiOkResponse(ResponseBookDto)
  async update(
    @Param('id') id: string,
    @Body() bookDto: UpdateBookDto,
  ): Promise<Response<BookDto>> {
    const book = await this.bookService.update(id, bookDto, bookDto.quantity);
    return this.ok(mapBookToDto(book));
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Response<void>> {
    await this.bookService.delete(id);
    return this.ok();
  }
}
