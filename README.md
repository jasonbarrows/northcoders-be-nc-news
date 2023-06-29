# Northcoders News API
An API to serve as the back end of a social news aggregation, content rating and discussion website, such as Reddit.

## Background
This project is the outcome of a week-long sprint on the Northcoders software development bootcamp.

The intention of the sprint was to mimic the building of a real world backend service which would provide the API for a future front end project.

The application has been implemented in node/express and PostgreSQL using MVC design patterns.

The API along with a description of available endpoints can be found at https://nc-news-t20n.onrender.com/api/.

## Getting Started

### Dependencies

In order to the run the project you will need:

- Node.js v16 or later
- PostgreSQL 14 or later

### Installation

1.  Clone the repository.
    ``` bash
    git clone https://github.com/jasonbarrows/northcoders-be-nc-news.git
    ```
2.  `cd` into the cloned repository directory.

3.  Install NPM packages.
    ``` bash
    npm install
    ```
4.  Run the script to setup the test and development databases.
    ``` bash
    npm run setup-dbs
    ```
5.  Create two `.env` files in the root of the project.

    In `.env.development` add PGDATABASE=nc_news and in `.env.test` add PGDATABASE=nc_news_test.

    An example file `.env-example` has been included as a reference.
6.  Seed the development database.
    ``` bash
    npm run seed
    ```
### Tests
Run all tests for the project.
``` bash
npm test
```
