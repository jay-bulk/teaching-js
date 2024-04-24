// Author: Rhett Bulkley
import express from 'express'
import { execQuery } from './dbConnExec.js'
 
const app = express()

app.user(express.json())
const PORT = 1340
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
}) 

app.get('/health', (req, res) => {
  res.status(200).send({status: ok})
})

app.get('/transactions', (req, res) => {
  const query = `select Transactions.TransactionID, Transactions.MonthID, 
                    Transactions.UserBudgetID, Transactions.CategoryID, 
                    Transactions.TransactionAmount, Transactions.Memo,
                    UserBudget.UserID, LoginInfo.FullName
                      from ((Transactions inner join UserBudget 
                      on Transactions.UserBudgetID = UserBudget.UserBudgetID)
                      inner join LoginInfo on UserBudget.UserID = LoginInfo.UserID) 
                      order by Transactions.MonthID`;
  execQuery(query)
  .then(result => {
    res.status(200).send(result)
  })
  .catch(err => {
    console.log(err)
    res.status(500).send()
  })
})

app.get('/transactions/:month_id', (req, res) => {
  if (req.params.month_id.match(/^-?\d+$/)) {
  const query = `select Transactions.TransactionID, Transactions.MonthID, 
                    Transactions.UserBudgetID, Transactions.CategoryID, 
                    Transactions.TransactionAmount, Transactions.Memo,
                    UserBudget.UserID, LoginInfo.FullName
                      from ((Transactions inner join UserBudget 
                      on Transactions.UserBudgetID = UserBudget.UserBudgetID)
                      inner join LoginInfo on UserBudget.UserID = LoginInfo.UserID) 
                      where Transactions.MonthID = ${req.params.month_id}
                      order by Transactions.MonthID`;
  execQuery(query)
  .then(result => {
    if (result.length === 1) {
    res.status(200).send(result[0])
    } else {
      res.status(404).send('Bad Request')
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).send()
  })
  } else {
    res.status(404).send('Invalid path parameter')
  }
})

app.post('/register', async (req, res) => {
  let fullName = req.body.fullName
  let uName = req.body.uName
  let userPassword = req.body.userPassword

  if (!fullName || !uName || !userPassword) {
    return res.status(400).send('Bad Request Missing Item')
  }
  fullName = fullName.replace("'", "''")
  uName = uName.replace("'", "''")
  userPassword = userPassword.replace("'", "''")
  uRole = 'User'
})