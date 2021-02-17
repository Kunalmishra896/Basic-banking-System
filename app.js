const { concatSeries } = require('async');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');


mongoose.connect('mongodb://localhost:27017/BankDB', { useNewUrlParser: true, useUnifiedTopology: true ,useFindAndModify: false });

const bankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        min: 0,
        required: true
    }
})

const Customermodel = mongoose.model('Customermodel', bankSchema);

const transactionSchema = new mongoose.Schema({
    fromName : {
        type : String,
        required: true
    },
    toName : {
        type : String,
        required: true
    },
    transfer : {
        type : Number,
        required: true
    }
})

const Transaction = mongoose.model('Transaction', transactionSchema);

const customerDetails = [
    { 
        name: "kunal Mishra",
    email: "mishrakunal986@gmail.com",
    balance: 250000
},
    { 
        name: "Avantika Dubey",
    email: "avantikadubey@gmail.com",
    balance: 120000
},
    { name: "Tushar Dhayade",
    email: "tushardhayade6@gmail.com",
    balance: 270000},
    { name: "Hrtitka Bhagat",
    email: "bhagath@gmail.com",
    balance: 210000},
    { name: "Santoshi Sabat",
    email: "sabatsantoshi@gmail.com",
    balance: 20000},
    { name: "Shreyash Singh",
    email: "singhshreyash@gmail.com",
    balance: 30000},
    { name: "Smith Kore",
    email: "smithkore66@gmail.com",
    balance: 820000},
    { name: "Smit Chaudhari",
    email: "smitchaudhari@gmail.com",
    balance: 20000},
    { name: "Abrar Dhadha",
    email: "dhadhaabrar@gmail.com",
    balance:670000},
    { name: "Kritka khadgi",
    email: "kritkakhadgi@gmail.com",
    balance: 390000},
]

// Customermodel.insertMany(customerDetails)
//     .then(res => console.log(res))
//     .catch(err => console.log(err))

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res)=>{
    res.render("index");
});

app.get("/customers",(req, res)=>{
    Customermodel.find({} , function(err,data){
        if(err){
            console.log(err);
        }else{
             res.render("customers", {users:data});
        }
    })

});

app.get("/customers/:id", async(req, res) =>{
    const { id } = req.params;
    const user = await Customermodel.findById(id, function(err,data){
        if(err){
    console.log(err);
        }else{
         return data;
        }
    })
    const users = await Customermodel.find({} , function(err,data){
    if(err){
        console.log(err);
        }else{
         return data;
        }
    })
    res.render("transfer", {user, users});
});

app.get("/customers/:id1/:id2", async(req, res) =>{
    const {id1, id2} = req.params;
    const fromUser = await Customermodel.findById(id1);
    const toUser = await Customermodel.findById(id2);
    res.render("form", {fromUser, toUser});
});

app.put("/customers/:id1/:id2", async(req, res) =>{
    const {id1, id2} = req.params;
    const credit = parseInt(req.body.credit);
    const fromUser = await Customermodel.findById(id1);
    const toUser = await Customermodel.findById(id2);

    if(credit <= fromUser.balance && credit>0){
        
        let fromCreditsNew = fromUser.balance - credit;
        let toCreditsNew = parseInt(toUser.balance + credit);
        await Customermodel.findByIdAndUpdate(id1, {balance : fromCreditsNew}, { runValidators: true, new: true });
        await Customermodel.findByIdAndUpdate(id2, {balance : toCreditsNew}, { runValidators: true, new: true });
        
        let newTransaction = new Transaction();
        newTransaction.fromName = fromUser.name;
        newTransaction.toName = toUser.name;
        newTransaction.transfer = credit;
        await newTransaction.save();

        res.redirect("/customers");
    }
    else{
        res.render('error');
    }
});

app.get("/history", async(req, res)=>{
    const transactions = await Transaction.find({});
    res.render("history", {transactions});
});

app.listen(3000 || process.env.PORT, process.env.IP, ()=>{
    console.log("Server started at port 3000");
});

