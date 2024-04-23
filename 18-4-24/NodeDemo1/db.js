import sql from 'mssql'

const config = {
    user: process.env.DB_USER ?? '', 
    password: process.env.DB_PASSWORD ?? '',
    server: process.env.DB_HOST ?? '',
    database: process.env.DB_SCHEMA ?? '',
    trustServerCertificate: true
}

sql.connect(config)
.then(conn => {
    return conn.query('Select * from film')
})
.then(data => {
    console.log(data.recordset)

})
.catch(err => {console.log(`${err}: something went wrong`)})