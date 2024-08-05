import { Entity } from '@common/entity';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type BookDocument = HydratedDocument<Book>;

@Schema({ timestamps: true })
export class Book extends Entity {
  @Prop()
  title: string;

  @Prop()
  author: string;

  @Prop()
  publicationYear: number;

  @Prop()
  publisher: string;

  @Prop({ type: Types.Decimal128 })
  price: number;

  constructor(book: Book) {
    super(book);
    this.title = book.title;
    this.author = book.author;
    this.publisher = book.publisher;
    this.price = book.price;
    this.publicationYear = book.publicationYear;
  }
}

export const BookSchema = SchemaFactory.createForClass(Book);
