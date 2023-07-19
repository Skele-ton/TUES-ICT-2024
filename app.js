const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(`mongodb+srv://nn-admin:${process.env.USER_PASSWORD}@cluster0.i0hvpv3.mongodb.net/toDoListDB?retryWrites=true&w=majority`);

const itemSchema = new mongoose.Schema({
	name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({name: "First"});
const item2 = new Item ({name: "Second"});
const item3 = new Item ({name: "Third"});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
	name: String,
	items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

function getList(req, res, headingName) {
	List.findOne({name: headingName})
	.then(function(list) {
		if (list === null) {
			const newList = new List({
				name: headingName,
				items: defaultItems
			});

			List.create(newList)
			.then(() => {
				res.redirect(`/${headingName}`);
			})
			.catch(err => console.log(err));
		} else {
			res.render("list", {listTitle: list.name, newListItems: list.items});
		}
	})
	.catch(err => console.log(err));
}

app.get("/", (req, res) => {
	getList(req, res, "Today");
});

app.get("/:listName", (req,res) => {
	if(req.params.listName ===  _.capitalize(req.params.listName)) {
		getList(req, res, _.capitalize(req.params.listName));
	} else {
		res.redirect(`/${_.capitalize(req.params.listName)}`);
	}
});

app.post("/", (req, res) => {
	const newItem = new Item({
		name: req.body.newItem
	});

	const listName = req.body.list;

	List.findOne({name: listName})
	.then(list => {
		list.items.push(newItem)
		List.updateOne({name: listName}, list)
		.then(() => res.redirect(`/${listName}`))
		.catch((err) => console.log(err));
		
	})
	.catch(err => console.log(err));
});

app.post("/delete", (req, res) => {
	List.findOneAndUpdate({name: req.body.listName}, {$pull: {items: {_id: req.body.checkbox}}})
	.then(res.redirect(`/${req.body.listName}`))
	.catch(err => console.log(err));
});

app.listen(port, () => console.log(`Server started on port ${port}`));
