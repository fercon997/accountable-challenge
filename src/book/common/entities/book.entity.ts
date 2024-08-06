import { Entity } from '@common/entity';
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Schema as schema } from 'mongoose';

export type BookDocument = HydratedDocument<Book>;

@Schema({ timestamps: true, versionKey: false, _id: false })
export class Book extends Entity {
  @Prop()
  _id: string;

  @Prop()
  title: string;

  @Prop()
  author: string;

  @Prop()
  publicationYear: number;

  @Prop()
  publisher: string;

  @Prop({ type: schema.Types.Decimal128 })
  price: number;

  @Prop({ default: true })
  isAvailable: boolean;

  constructor(book: Book) {
    super(book);
    this.title = book.title;
    this.author = book.author;
    this.publisher = book.publisher;
    this.price = book.price;
    this.publicationYear = book.publicationYear;
    this.isAvailable = book.isAvailable;
  }
}

export const BookSchema = SchemaFactory.createForClass(Book);
