# FinanzCSU Node API

[Routes](#routes)
[Running Locally](#local-setup)

## Routes
* [GET /health](#health)
* [GET /transactions](#get-all-transactions)
* [GET /transactions/:month_id](#get-transactions-by-month)
* [POST /transactions/add](#record-transaction)
* [POST /register](#register-new-user)
* [POST /login](#login-user)
* [POST /logout](#logout-user)

## Get Health
```bash
curl "localhost:1340/health"
```

```json
{
    "health": "ok"
}
```

## Get All Transactions
Returns all transactions
```bash
curl "localhost:1340/transactions"
```

Example Response
```json
[
    {
        "TransactionID": 3027,
        "MonthID": "FEB",
        "UserBudgetID": 100,
        "CategoryID": 1,
        "TransactionAmount": 1000,
        "Memo": "Income",
        "UserID": 1001,
        "FullName": "John Apple"
    },
    {...}
]
```

## Get Transaction By Month ID
Returns transactions for a given month
Params: month_id: String (ex: JAN, FEB, MAR, APR, MAY, ...)
```bash
curl "localhost:1340/transactions/:month_id"
```

Example Response
```json
[
    {
        "TransactionID": 3027,
        "MonthID": "FEB",
        "UserBudgetID": 100,
        "CategoryID": 1,
        "TransactionAmount": 1000,
        "Memo": "Income",
        "UserID": 1001,
        "FullName": "John Apple"
    },
    {...}
]
```

## Record Transaction
Add a transaction
```bash
curl -X POST "localhost:1340/transactions/add" \
-H "Authorization: Bearer ${token} \
-d "{
  'monthId': 'APR',
  'userBudgetId': 700,
  'categoryId': 2,
  'amount': 200.00,
  'memo': 'Thatched roof for the night' 
}"
```

Example Response
```json
{
  "TransactionID": 3082,
  "TransactionAmount": "200.00",
  "Memo": "Thatched roof for the night"
}
```

## Register New User
Create a new user
```bash
curl -X POST "localhost:1340/register" \
-H "Content-Type:application/json" \
-d '{ "FullName": "Little John", "Username":"littlejohn", "Password":"greentights" }'
```

Example Response
```json
Registration Successful
```

## Login User
Exhange credentials and get a token for authentcated calls
```bash
curl -X POST "localhost:1340/login" \
-H "Content-Type:application/json" \
-d '{ "Username":"littlejohn", "Password":"greentights" }'
```

Example Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwayI6MTAwNywiaWF0IjoxNzE0NTM5Nzc4LCJleHAiOjE3MTQ1NDE1Nzh9.ahnU-WjCvOs980RDnjD-etn-DWs3EwnmShLgn9k3Dgs",
  "UserInfo": {
    "FullName": "Little John",
    "Username": "johnlittle",
    "UserID": 1007
  }
}
```

## Logout User
Invalidate user token as a proxy for user logout
```bash
curl -X POST "localhost:1340/logout" \
-H "Content-Type:application/json" \
-H `Authorization: Bearer ${token}`
```

Example Response
```json
Successfully Logged Out
```

## Local Setup
Create a `.env` file in the root of the project with the following variables:
```conf
DB_USER='javan'
DB_PASSWORD='script'
DB_SCHEMA='Team106DB'
DB_HOST='buscissql1901.busdom.colostate.edu\\cisweb'
TRUST_CERT=true
JWT_PRIVATE_KEY='whataspecialkey'
```

From the root of the expressFinanzCSU directory run the following:

Install Dependencies and start the server
```bash
npm i
npm run dev
```