const express = require("express");
const app = express();
const path = require("path")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontEnd")));
const mongoose = require("mongoose");
const { stringify } = require("querystring");
const { isNull } = require("util");
mongoose.connect('mongodb://127.0.0.1:27017/dataDB')
    .then(() => {
        console.log("GOT CONNECTION")
    })
    .catch((error) => console.log("oh on falied", error));

let facultyschema = new mongoose.Schema({
    userid: String,
    sno: String,
    title: String,
    collaborating_agency: String,
    participant: String,
    year: String,
    duration: String,
    activity: String,
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const Faculty = mongoose.model("Faculty", facultyschema);
app.post("/data", (req, res) => {
    const { sno, title, collaborating_agency, participant, year, duration, activity } = req.body;
    let user = req.body
    const User = new Faculty({ sno: sno, title: title, collaborating_agency: collaborating_agency, participant: participant, year: year, duration: duration, activity: activity });
    User.save()
        .then((data) => { console.log(data) })
    res.redirect("facultydata.html")

})
app.get("/facultydata", async (req, res) => {
    try {
        const allFaculty = await Faculty.find(); // Fetch all documents
        res.render("display", { facultyData: allFaculty });
    } catch (error) {
        console.log("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
});


let studentlogin = new mongoose.Schema({
    userid: String,
    name: String,
    password: String,
    email: String,

});
let suserid;
const Student = mongoose.model("Student", studentlogin);
app.post("/slogin", (req, res) => {
    const { name, password, email } = req.body;
    const User = new Student({ name: name, password: password, email: email, });
    suserid = User._id
    console.log("this is user id", suserid)
    User.save()
        .then((data) => {
            const userUpdate = Student.updateOne({ _id: suserid }, { $set: { userid: suserid } }).then((data) => { console.log("Upadted/Added Userid ", data) })
            console.log("inserted"); console.log(data)
        })
    res.render("studentinternship", ({ suserid }))
});
app.get('/interndata/:id', async (req, res) => {
    const { id } = req.params
    console.log("Extraccted from the url", id)
    try {
        const details = await FormData.findOne({ userid: id });
        res.render("interndata", { entry: details });
    } catch (error) {
        res.send("Error No student data available")
    }

});
const formSchema = new mongoose.Schema({
    userid: String,
    name: String,
    mailid: String,
    mobilenumber: String,
    branch: String,
    collegename: String,
    certificates: String, // You can store file names if uploading
    companyname: String
});

const FormData = mongoose.model("FormData", formSchema);
app.post("/studentdata", async (req, res) => {
    const { name, mailid, mobilenumber, branch, collegename, certificates, companyname } = req.body;

    console.log("Received Data:", req.body);

    try {
        const user = new FormData({ userid: suserid, name, mailid, mobilenumber, branch, collegename, certificates, companyname });
        await user.save();
        console.log("Saved:", user);
        res.redirect("thankyou.html"); // Redirect after saving
    } catch (err) {
        console.log("Error saving data:", err);
        res.send("Error in submission!");
    }
});
const facultylogin = new mongoose.Schema({
    userid: String,
    name: String,
    password: String,
    email: String,

});
let fuserid;
const Faclogin = mongoose.model("Faclogin", facultylogin);
app.post("/plogin", (req, res) => {
    const { name, password, email } = req.body;
    const User = new Faclogin({ name: name, password: password, email: email, });
    fuserid = User._id;
    console.log("this is user id", fuserid)
    User.save()
        .then((data) => {
            const userUpdate = Faclogin.updateOne({ _id: fuserid }, { $set: { userid: fuserid } }).then((data) => { console.log("Upadted/Added Userid ", data) })
            console.log("inserted"); console.log(data)
        })
    res.render("facultydatafromfaculty", ({ fuserid }))
});
app.post("/ifacdata", async (req, res) => {
    const { sno, title, collaborating_agency, participant, year, duration, activity } = req.body;
    try {
        const user = new Faculty({ userid: fuserid, sno: sno, title: title, collaborating_agency: collaborating_agency, participant: participant, year: year, duration: duration, activity: activity });
        const savedUser = await user.save();
        console.log(savedUser);
        res.render("ifacdisplay", { user: savedUser });
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).send("An error occurred while saving data.");
    }
});
app.get('/facdata/:id', async (req, res) => {
    const { id } = req.params
    console.log("Extraccted from the url", id)
    try {
        const details = await Faculty.findOne({ userid: id });
        res.render("ifacdisplay", { user: details });
    } catch (error) {
        res.send("Error No student data available")
    }

});

app.get("/studentdisplay", async (req, res) => {
    const allData = await FormData.find();
    res.render("studentdisplay", { data: allData });
});
app.post("/search", async (req, res) => {
    const { search } = req.body;
    console.log(req.body)
    const results = await Faculty.find({
        $or: [{ activity: search },
        { title: search },
        { collaborating_agency: search },
        { participant: search },
        { year: search }
        ]
    });
    console.log(results)
    res.render("display", { facultyData: results });



});
app.listen("8080", console.log("Listening to port 8080"));