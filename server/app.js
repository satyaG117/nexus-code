const express = require('express');
const app = express();

const PORT = process.env.PORT || 8000;

// middleware to set allowed origin, headers and HTTP methods
// change according to requirements
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE , PUT');

    next();
})

// test route ; remove later
app.get('/hello',(req,res,next)=>{
    res.status(200).json({message : 'Hello world'});
})

app.listen(PORT, ()=> console.log('Server running on PORT : ',PORT));