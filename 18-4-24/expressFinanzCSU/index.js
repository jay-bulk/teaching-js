// Author: Rhett Bulkley
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { execQuery } from './dbConnExec.js'
import { auth } from './middleware/authenticate.js'
 
const app = express()

app.use(express.json())
const PORT = 1340
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
}) 

/** Server alive function */
app.get('/health', (req, res) => {
  res.status(200).send({ health: "ok"})
})

/** Get all transactions */
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

/** Get all transactions for a given monthId */
app.get('/transactions/:month_id', async (req, res) => {
  if (!req.params.month_id.match(/\w$/)) {
    res.status(404).send('Invalid path parameter')
  }
  const query = `select Transactions.TransactionID, Transactions.MonthID, 
                    Transactions.UserBudgetID, Transactions.CategoryID, 
                    Transactions.TransactionAmount, Transactions.Memo,
                    UserBudget.UserID, LoginInfo.FullName
                      from ((Transactions inner join UserBudget 
                      on Transactions.UserBudgetID = UserBudget.UserBudgetID)
                      inner join LoginInfo on UserBudget.UserID = LoginInfo.UserID) 
                      where Transactions.MonthID = '${req.params.month_id}'
                      order by Transactions.MonthID`;
  await execQuery(query)
  .then(result => {
    if (result.length >= 1) {
    res.status(200).send(result)
    } else {
      console.log(result)
      res.status(404).send('Bad Request')
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).send()
  })
})

/** Add transaction item for a users budget */
app.post('/transactions/add', auth, async (req, res) => {
  try {
    const monthId = req.body.monthId
    const userBudgetId = req.body.userBudgetId
    const categoryId = req.body.categoryId
    const amount = Number.parseFloat(req.body.amount).toPrecision(8)
    let memo = req.body.memo ?? ''

    /** Check for required params */
    if (!monthId || !userBudgetId || !categoryId || !amount){
      res.status(400).send('Bad Request')
    }

    memo = memo.replace("'", "''")

    const addTransaction = `Insert into Transactions(monthid, userbudgetid, categoryid, transactionamount, memo)
                            Output inserted.TransactionID, str(inserted.TransactionAmount, 8, 2) as TransactionAmount, inserted.Memo
                            VALUES ('${monthId}', ${userBudgetId}, ${categoryId}, ${amount}, '${memo}')`
    // console.log(addTransaction)
    const data = await execQuery(addTransaction)
    data[0].TransactionAmount = Number.parseFloat(data[0]?.TransactionAmount).toPrecision(4)
    res.status(201).send(data[0])
 } catch (err) {
  console.error(err, 'Error adding transaction')
  res.status(500).send('Internal Server Error')
 }
})

/** Register a new user */
app.post('/register', async (req, res) => {
  let fullName = req.body.FullName
  let uName = req.body.Username
  const userPassword = req.body.Password

  if (!fullName || !uName || !userPassword) {
    return res.status(400).send('Bad Request Missing Item')
  }
  fullName = fullName.replace("'", "''")
  uName = uName.replace("'", "''")
  const uRole = 'User'

  const UNameCheckQuery = `SELECT UName from NodeLoginInfo where UName = '${uName}'`

  const duplicateUserName = await execQuery(UNameCheckQuery)
  if (duplicateUserName[0]){
      return res.status(400).send('Please enter a different username')
  }

  const hashedPassword = bcrypt.hashSync(userPassword)

  const userInsert = `INSERT INTO NodeLoginInfo(UName, UPass, FullName, URole)
                        VALUES('${uName}','${hashedPassword}','${fullName}','${uRole}')`
  await execQuery(userInsert)
  .then(() => {
    res.status(201).send('Registration Successful')
  })
  .catch((err) => {
    console.error(err, 'Invalid Registration.')
    return res.status(500).send('Registration Unsuccessful. Please try again later')
  })
})

/** Authenticate a user and generate/return a token */
app.post('/login', async (req, res) => {

  const uName = req.body.Username
  const userPassword = req.body.Password

  const UNameCheckQuery = `SELECT * from NodeLoginInfo where UName = '${uName}'`
  let result;
  try {
    result = await execQuery(UNameCheckQuery)
  } catch (err) {
    console.error('Login error', err)
    return res.status(500).send()
  }
  console.log(result)
  if (!result[0]) {
    res.status(500).send('Internal Server Error')
  }

  const user = result[0]

  if (!bcrypt.compareSync(userPassword, user.UPass)) {
    return res.status(401).send('Invalid Credentials')
  }

  const token = jwt.sign({pk: user.UserID}, process.env.JWT_PRIVATE_KEY, {expiresIn: '30 minutes'})

  const setTokenQuery = `UPDATE NodeLoginInfo 
                        SET Token = '${token}' WHERE UserID = '${user.UserID}'`

  try {
    await execQuery(setTokenQuery)

    res.status(200).send({
      token: token,
      UserInfo: {
        FullName: user.FullName,
        Username: user.UName,
        UserID: user.UserID
      }
    })
  } catch (err) {
    console.error(err, 'Failed to get token')
    res.status(500).send()
  }
})

/** Log a user out by nullifying their JWT */
app.post('/logout', auth, async (req, res) => {
  const logoutUser = `Update NodeLoginInfo Set token=NULL WHERE UserId = ${req.user.UserID}`
  await execQuery(logoutUser)
  .then(() => {
    res.status(201).send('Successfully Logged Out')
  })
  .catch(err => {
    console.error(err, 'Failed to logout')
    res.status(500).send('Logout Failed. Try again later')
  })
})
