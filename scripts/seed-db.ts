import mongoose from 'mongoose';

import { Book, BookSchema } from '@book/common/entities';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import converter = require('csvtojson');
import {
  BookInventory,
  BookInventorySchema,
  Wallet,
  WalletSchema,
} from '@reservation/common/entities';
import factory from 'factory-girl';
import {
  Permission,
  PermissionSchema,
  Role,
  RoleSchema,
  User,
  UserSchema,
} from '@user/common/entities';
import { faker } from '@faker-js/faker';
import { hash, genSalt } from 'bcrypt';
import { Genres, PermissionMap } from '@shared/types';

async function seedBooks() {
  const file = await converter({ delimiter: ',' }).fromFile(
    './scripts/books_sample_challenge.csv',
  );

  const booksModel = mongoose.model('books', BookSchema);

  const bookGenres = Object.values(Genres);
  const books = file.map((entry) => {
    const genreId = faker.number.int({ min: 0, max: bookGenres.length - 1 });
    const book: Partial<Book> = {
      _id: entry.id,
      author: entry.author.toLowerCase(),
      price: Number(entry.price),
      publicationYear: entry.publication_year,
      publisher: entry.publisher,
      title: entry.title.toLowerCase(),
      genre: bookGenres[genreId],
    };
    return book;
  });

  await booksModel.create(books);

  const booksInventory = books.map((book) => {
    const inventory: Partial<BookInventory> = {
      bookId: book._id,
      totalInventory: 4,
      totalReserved: 0,
    };

    return inventory;
  });

  const booksInventoryModel = mongoose.model(
    'BookInventory',
    BookInventorySchema,
  );

  await booksInventoryModel.create(booksInventory);
}

async function seedUsers() {
  const permissionsModel = mongoose.model('Permission', PermissionSchema);

  let permissions: Permission[] = Object.values(PermissionMap).map(
    (permission) => ({ name: permission }),
  );

  permissions = await permissionsModel.create(permissions);

  const adminPermissions = permissions.filter(
    (permission) =>
      permission.name === PermissionMap.allBooks ||
      permission.name === PermissionMap.allUser,
  );

  const userPermissions = permissions.filter(
    (permission) => permission.name === PermissionMap.getBook,
  );

  const roleModel = mongoose.model('Role', RoleSchema);

  let adminRole = new Role({ name: 'admin', permissions: adminPermissions });
  let userRole = new Role({ name: 'user', permissions: userPermissions });

  adminRole = await roleModel.create(adminRole);
  userRole = await roleModel.create(userRole);

  factory.define('user', User, {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: await hash(faker.internet.password(), await genSalt()),
    role: userRole,
  });

  const usersModel = mongoose.model('User', UserSchema);

  const adminUser = new User({
    name: 'Admin',
    email: 'admin@admin.com',
    password: await hash('admin', await genSalt()),
    role: adminRole,
  });

  const user = new User({
    name: 'Regular User',
    email: 'regular@regular.com',
    password: await hash('regular', await genSalt()),
    role: userRole,
  });

  let users = await factory.buildMany('user', 5);
  users = [adminUser, user, ...users];

  users = await usersModel.create(users);

  const walletModel = mongoose.model('Wallet', WalletSchema);

  const wallets: Wallet[] = users.map((user: User) => {
    return new Wallet({ userId: user._id, balance: 0 });
  });

  await walletModel.create(wallets);
}

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/accountable', {
    connectTimeoutMS: 1000,
  });

  await mongoose.connection.db.dropDatabase();

  await seedBooks();

  await seedUsers();

  await mongoose.disconnect();
}

seed();
