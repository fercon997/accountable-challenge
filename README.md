## Running the app

Create your `.env` file, you can copy `.env.example` and the application will run.

### Running with docker

There are several docker containers set up for the app and the mongodb
DB the only thing needed to start the app is to run docker compose

```bash
docker-compose up
```

### Running manually

#### Prerequisites

* Nodejs 20
* Mongo DB installed locally or running on a container (You can use the container defined in this project)

```
npm i
npm run start:dev
```

## Running Seeds

The application can be seeded with sample data using a defined command, it creates 100k books and 10k users, however
there are only 2 users accessible, you'll find the credentials further into this document.

You can either seed the database within the docker container or manually

### With docker

After having the containers up you can tun

```bash
docker exec node-app npm run seed
```

### Manually

Make sure you have a mongoDB instance up and running and the correct connection URI in the `.env` file

```bash
npm run seed
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Documentation

After starting the server you'll find an OpenApi documentation by going to the `/docs` endpoint in your browser, in
there you can test each endpoint

## Testing the application

After seeding the database there are 2 available users with which you can run tests, the credentials are in the
following format `email:password`

* admin@admin.com:admin
* regular@regular.com:regular

Both users can do essentially the same, the only difference is that the admin user can create books while the regular
user cannot

> Note: Every endpoint except login requires a token in order to authenticate the user, be sure to call login and get a
> token before calling any other endpoint

Regarding the scheduled tasks each is scheduled to run once a day, if you need to test them you'll need to change the
cron declaration to a shorter time

## Architecture

The application is broke down into modules based on the domains:

* `User module`: Handles everything regarding user information and authentication.
* `Book module`: Handles book information and catalogs
* `Reservation module`: This is kind of a hybrid module, it contains reservation data, book inventories and user's
  wallet.
  This approach was taken in order to reduce complexity regarding the transactions of the system, having them separately
  would add complexity to the operations being made, having to require distributed transactions.
* `Notifications module`: Handles communications to users
* `Shared module`: This is meant to be a common module that contains common middlewares and components used in the other
  modules.

The goal of an architecture like this is to focus heavily on domains and separation of concerns, in real world
applications, probably the best approach is to split into microservices, could be moved into its own server without
having to completely refactor the code base.

### General concerns

Because of time constrains there are some caveats to the application

* Emails are not being actually sent, the module is scaffolded but there is no integration with an email provider.
* The reminders and scheduled tasks are not fault tolerant, they only ensure data consistency, however if something goes
  wrong there is no way to retry, which could lead to fees not being applied or reminders not being sent.
* There is a rudimentary authentication implemented
* There is no admin module, there are roles and permissions for it but the application is missing endpoints to manage
  users, reservations, etc,
* The application lacks integration and e2e tests, it does have a full coverage of unit tests but any application should
  cover every layer of the testing pyramid
