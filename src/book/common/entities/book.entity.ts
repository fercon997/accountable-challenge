import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Schema as schema } from 'mongoose';
import { Entity } from '@shared/entity';
import { Genres } from '@shared/types';

export type BookDocument = HydratedDocument<Book>;

@Schema({ timestamps: true, versionKey: false, _id: false })
export class Book extends Entity {
  @Prop()
  _id: string;

  @Prop({ index: true })
  title: string;

  @Prop({ index: true })
  author: string;

  @Prop()
  publicationYear: number;

  @Prop()
  publisher: string;

  @Prop({ type: schema.Types.Decimal128 })
  price: number;

  @Prop({ default: true })
  isAvailable?: boolean;

  @Prop({ enum: Genres, index: true })
  genre: Genres;

  constructor(book: Book) {
    super(book);
    this.title = book.title;
    this.author = book.author;
    this.publisher = book.publisher;
    this.price = book.price;
    this.publicationYear = book.publicationYear;
    this.isAvailable = book.isAvailable;
    this.genre = book.genre;
  }
}

export const BookSchema = SchemaFactory.createForClass(Book);
