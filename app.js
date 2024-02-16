require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));






// MongoDB/Mongoose Functions below

    // mongoose.connect("mongodb://localhost:27017/todolistDB");

    mongoose.connect(`mongodb+srv://deeno:${process.env.MONGODB_PASSWORD}@cluster0.zg4yvyq.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`)

    // items schema 

    const itemsSchema = {
        name: String
    };

    // items model 

    const Item = mongoose.model("Item", itemsSchema);


    // Default Items for empty lsit

    const Item1 = new Item ({
        name: "Welcome to your todolist."
    });

    const Item2 = new Item ({
        name: "Hit the + button to add a new item."
    });

    const Item3 = new Item ({
        name: "<-- Hit this to delete an item."
    });



    const defaultItems = [Item1, Item2, Item3];

    // List Schema
    const listSchema = {
        name: String,
        items: [itemsSchema],
    };

    // List Model
    const List = mongoose.model("List", listSchema);




app.get("/", function(req, res){

    Item.find({}).then(function(foundItems){

        if (foundItems.length === 0 ){
        Item.insertMany(defaultItems).then(function(){
            console.log("Documents were added into the collection.")
        }
        ).catch(function(err){
        console.log(err)
        });

        res.redirect("/");

        } else {

        res.render("list", {
            listTitle : "Today",
            newListItems: foundItems,
        });
        };

    }).catch(function(err){
        console.log(err)
    });

});





app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect(`/${listName}`);
        }).catch(err=>{
            console.log(err);
        })
    };


});






// function to deleta items from list 
app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, ).then(result=>{
        console.log(`The document named ${result.name} was removed from the collection.`);
        res.redirect("/");
    });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(foundList){
            res.redirect(`/${listName}`);
        }).catch(err=>{console.log(err)});
    };


});




app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name: customListName}).then(function(foundList){
        if(!foundList){
            // Create new list
            const list = new List({
                name: customListName,
                items: defaultItems,
            })

            list.save().then(function(){
                res.redirect(`/${customListName}`);
            }).catch(err=>{console.log(err)});
        } else {
            // Show an existing list
            res.render("list", {
                listTitle : foundList.name,
                newListItems: foundList.items,
            });
        };
    }).catch(function(err){
        console.log(err)
    });

});


// function to drop a whole collection and its content 

// const conn = mongoose.createConnection('mongodb+srv://deeno:LOG6WsGwGkNks0JG@cluster0.zg4yvyq.mongodb.net/todolistDB?retryWrites=true&w=majority');
// conn.dropCollection("lists").then(function(){
//     console.log('success')
// }).catch(err=>{
//     console.log(err);
// });



app.get("/about", function(req, res){
    res.render("about", {

    });
})

// List.findOne({name: "Work"}).then(function(result){
//     console.log(`${result} document(s) were deleted`);
// }).catch(err=>{
//     console.log(err);
// });

app.listen(3000, function(){
    console.log(`Server is running on port ${process.env.PORT}`)
});