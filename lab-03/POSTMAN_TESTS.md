# Lab 3: Postman test list

Import `postman/lab-03.postman_collection.json` into Postman (it has a `baseUrl` variable, default `http://localhost:3000`) and run the collection in order. Each request has a test script that checks the status code (and the `{ "message": ... }` error shape for failures).

Run the folder **1. Success cases** first, because the create request stores `createdId` for the get, update and delete requests after it.

## 1. Success cases

| # | Request | Method and URL | Expected status |
| --- | --- | --- | --- |
| 1 | GET /books (defaults) | `GET /books` | 200 |
| 2 | GET /books search_q=clean | `GET /books?search_q=clean` | 200 |
| 3 | GET /books sort by price DESC | `GET /books?order_by=price&order=DESC` | 200 |
| 4 | GET /books pagination (limit=3, offset=3) | `GET /books?limit=3&offset=3` | 200 |
| 5 | GET /books price range 400-600 | `GET /books?min_price=400&max_price=600` | 200 |
| 6 | GET /books combined filters | `GET /books?search_q=js&max_price=400&order_by=title&order=ASC&limit=5` | 200 |
| 7 | POST /books (create) | `POST /books` | 201 |
| 8 | GET /books/:id (the created book) | `GET /books/{{createdId}}` | 200 |
| 9 | PUT /books/:id (update) | `PUT /books/{{createdId}}` | 200 |
| 10 | DELETE /books/:id | `DELETE /books/{{createdId}}` | 200 |

## 2. Failure cases

| # | Request | Method and URL | Expected status |
| --- | --- | --- | --- |
| 11 | POST missing title | `POST /books` | 400 |
| 12 | POST missing author | `POST /books` | 400 |
| 13 | POST missing price | `POST /books` | 400 |
| 14 | POST non-numeric price | `POST /books` | 400 |
| 15 | POST negative price | `POST /books` | 400 |
| 16 | POST malformed JSON | `POST /books` | 400 |
| 17 | PUT invalid body | `PUT /books/1` | 400 |
| 18 | PUT id does not exist | `PUT /books/999999` | 404 |
| 19 | GET id does not exist | `GET /books/999999` | 404 |
| 20 | DELETE id does not exist | `DELETE /books/999999` | 404 |
| 21 | GET id is not a number | `GET /books/abc` | 400 |
| 22 | GET bad order_by | `GET /books?order_by=password` | 400 |
| 23 | GET bad order | `GET /books?order=sideways` | 400 |
| 24 | GET limit too large | `GET /books?limit=1000` | 400 |
| 25 | GET negative offset | `GET /books?offset=-1` | 400 |
| 26 | GET non-numeric min_price | `GET /books?min_price=cheap` | 400 |
| 27 | GET min_price greater than max_price | `GET /books?min_price=900&max_price=100` | 400 |
| 28 | Unknown route | `GET /authors` | 404 |
