import { Book } from '../../common/entities';
import { BookDto } from '../dto';

export const mapBookToDto = (book: Book): BookDto => {
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
  new Book({ _id: bookDto.id, ...bookDto });
