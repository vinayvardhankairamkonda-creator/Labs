# Lab 1: Node.js and Express server

YOUR NAME K. Vinay Vardhan · YOUR REGISTRATION NUMBER 252U1R9052 · YOUR SECTION CSE(GEN-AI)2A&304

**Live link:** https://labs-mu-nine.vercel.app/
## How to run

```bash
npm install
npm start            # Express server on http://localhost:3000
npm run start:plain  # plain http module server (Task 3)
```

Environment variables: `PORT` (optional, defaults to 3000).

## Endpoints

| Method | Path     | Status | Description                              |
| ------ | -------- | ------ | ---------------------------------------- |
| GET    | `/`      | 200    | Welcome text                             |
| GET    | `/about` | 200    | JSON with name and section               |
| GET    | `/time`  | 200    | Current date and time                    |
| GET    | any other| 404    | "404 - Route not found" message          |

## Screenshots

![Home route](screenshots/home.png)
![About route](screenshots/about.png)
![Time route](screenshots/time.png)
![404 route](screenshots/not-found.png)

## package.json fields

- **name**: package name
- **version**: current version of the project
- **description**: short summary of the project
- **main**: entry-point file
- **scripts**: commands run with `npm run <name>` (`npm start` for `start`)
- **keywords**: search tags for the npm registry
- **author**: who wrote it
- **license**: terms of use
- **dependencies**: packages needed to run (Express); installed into `node_modules/`

## Notes

_Problems faced and how you solved them._
