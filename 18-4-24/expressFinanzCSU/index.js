// Author: Rhett Bulkley
import express from 'express'
import { execQuery } from './dbConnExec.js'
 
const app = express()

app.user(express.json())
const PORT = 1340
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
}) 

/** Server alive function */
app.get('/health', (req, res) => {
  res.status(200).send({status: ok})
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

/** Register a new user */
app.post('/register', async (req, res) => {
  let fullName = req.body.fullName
  let uName = req.body.uName
  const userPassword = req.body.userPassword

  if (!fullName || !uName || !userPassword) {
    return res.status(400).send('Bad Request Missing Item')
  }
  fullName = fullName.replace("'", "''")
  uName = uName.replace("'", "''")
  uRole = 'User'

  const UNameCheckQuery = `SELECT UName from LoginInfo where UName = '${uName}'`

  const duplicateUserName = await execQuery(UNameCheckQuery)
  if (duplicateUserName[0]){
      return res.status(400).send('Please enter a different username')
  }

  const hashedPassword = bcrypt.hashSync(userPassword)

  const userInsert = `INSERT INTO LoginInfo(UName, UPass, FullName, URole)
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

  const uName = req.body.uName
  const userPassword = req.body.userPassword

  const UNameCheckQuery = `SELECT UName from NodeLoginInfo where UName = '${uName}'`
  let result;

  try {
    result = await execQuery(UNameCheckQuery)
  } catch (err) {
    console.error('Login error', err)
    return res.status(500).send()
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
      'jwt-assertion': token,
      UserInfo: {
          'Full Name': user.FullName,
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

/** Add transaction item for a users budget */
app.post('/transactions/add', auth, async (req, res) => {
  try {
    const monthId = req.body.monthId
    const userBudgetId = req.body.userBudgetId
    const categoryId = req.body.categoryId
    const amount = req.body.transactionAmount
    let memo = req.body.memo ?? ''

    /** Check for required params */
    if (!monthId || !userBudgetId || !categoryId || !amount){
      res.status(400).send('Bad Request')
    }

    memo = memo.replace("'", "''")

    const addTransaction = `Insert into Transacations(monthid, userbudgetid, categoryid, transactionamount, memo)
                            Output inserted.TransactionID, inserted.TransactionAMount, inserted.Memo
                            VALUES (${monthId}, ${userBudgetId}, ${categoryId}, ${amount}, ${memo})`
    const data = await execQuery(addTransaction)
    res.status(201).send(data[0])
 } catch (err) {
  console.error(err, 'Error adding transaction')
  res.status(500).send('Internal Server Error')
 }
})
