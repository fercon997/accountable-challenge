import { Book } from '../../common/entities';
import { BookDto, ResponseBookDto } from '../dto';

export const mapBookToDto = (book: Book): ResponseBookDto => {
  const {
    _id: id,
    author,
    price,
    genre,
    publicationYear,
    isAvailable,
    publisher,
    title,
  } = book;

  return {
    id,
    title,
    author,
    publicationYear,
    publisher,
    price,
    genre,
    isAvailable,
  };
};

export const mapDtoToBook = (bookDto: BookDto) =>
  new Book({
    _id: bookDto.id,
    ...bookDto,
    author: bookDto.author.toLowerCase(),
  });

export const mapBookArrayToDto = (books: Book[]): ResponseBookDto[] =>
  books.map(mapBookToDto);
