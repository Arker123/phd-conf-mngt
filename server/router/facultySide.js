const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

// connection established
require('../mongoDb/connection');


// requiring user Schema                
const User = require('../model/userSchema');
const AppData = require('../model/applicationData');

// credentials import
require('dotenv').config();

const searchDriveFolder = require('../driveUploadFunctions/searchFolder');
const uploadImageDrive = require('../driveUploadFunctions/uploadImage');
const createPublicUrl = require('../driveUploadFunctions/createPublicUrl');

router.post('/facultyInfoLoading', async (req, res) => {
    const { email } = req.body;
    console.log(email)
    try {
        const student = await User.findOne({ email: email })
        // if(student.role !== 1)
        return res.status(200).json(student);

    } catch (error) {
        console.log(error);
        return res.status(420).json({ message: "bad" });
    }
});

router.post('/fetchingNewApplicationFaculty', async (req, res) => {

    const { email } = req.body;
    try {
        const status = "0";
        const appData = await AppData.find({ status: status });

        var filteredData = new Array();

        // const l = appData.length;
        // console.log(l);
        for (let i = 0; i < appData.length; i++) {
            const semail = appData[i].email;
            const user = await User.findOne({ email: semail });
            // console.log(user);
            if (user.nameOfSupervisor === email) {
                // console.log(data);
                filteredData.push(appData[i]);
            }
        }
        // console.log(filteredData);
        // Debug Purpose
        // console.log(appData);
        // console.log(typeof(appData));        // Object
        // appData.forEach( (data) => {
        //     console.log(data._id + "\t" + data.nameOfConference);
        // })

        return res.status(200).json(filteredData);
    } catch (error) {
        console.log(error);
        return res.status(422).json("Error Occurred..");
    }
});

router.post('/approvedFacultyApplication', async (req, res) => {
    const { email } = req.body;
    try {
        const appData = await AppData.find();

        var filteredData = new Array();
        // console.log(appData);
        for (let i = 0; i < appData.length; i++) {
            const semail = appData[i].email;
            const user = await User.findOne({ email: semail });
            // console.log(user);
            if (user.nameOfSupervisor === email && appData[i].status !== "-1" && appData[i].status !== "0") {
                filteredData.push(appData[i]);
            }
        }
        return res.status(200).json(filteredData);
    } catch (error) {
        console.log(error);
        return res.status(422).json("Error Occurred..");
    }
});

router.post('/studentInfoFaculty', async (req, res) => {
    const { semail, femail } = req.body;

    try {
        const user = await User.findOne({ email: semail });
        if (user.nameOfSupervisor === femail) {
            const appData = await AppData.find({ email: semail });
            return res.status(200).json(appData);
        }
        else {
            return res.status(421).json("not under your supervision..")
        }
    } catch (error) {
        console.log(error);
        return res.status(422).json("Error Occurred..");
    }
});


// Approve or Disapprove Logic
router.post('/facultyApproveOrDisapprove', async (req, res) => {
    var { id, status, image } = req.body;

    try {

        const bearerHeader = await req.headers["authorization"];

        if (!bearerHeader) {
            return res.status(422).json({ error: "No Header" });
        }
        var bearerToken = bearerHeader.split(" ")[1];

        // console.log( "Student Side Token: " + bearerToken);
        if (!bearerToken) {
            console.log("No Token");
            return res.status(422).json({ error: "No Token" });
        }
        // verfiy the token
        var decode = jwt.verify(bearerToken, process.env.JWT_SECRET)
        //setting email from decode
        const userEmail = decode.email;

        const appData = await AppData.findById(id);

        if (appData.status !== "0")
            return res.status(422).json("Can't Approve Or Disapprove..");


        const applicationFolderName = appData.conferenceStarts + "-" + appData.conferenceEnds + "__" + appData.nameOfConference;
        const applicationFolderId = await searchDriveFolder(applicationFolderName);
        const facultySignId = await uploadImageDrive(image, applicationFolderId, userEmail, "facultySign.jpg");

        if (facultySignId === null) {
            return res.status(422).json("Error Occurred..");
        }

        const facultySignLink = await createPublicUrl(facultySignId);
        console.log(facultySignLink);
        await AppData.findByIdAndUpdate(id, {
            lastModified: userEmail,
            facultySignLink: facultySignLink,
            status: status,
        });
        
        return res.status(200).json("Updated..");
    } catch (error) {
        console.log(error);
        return res.status(422).json({ error: error });
    }
})

// viewing application for supervisor of students under him.
router.post('/viewFacultyApplications', async (req, res) => {

    const bearerHeader = await req.headers["authorization"];
    if (!bearerHeader) {
        return res.status(422).json({ error: "No Header" });
    }
    var bearerToken = bearerHeader.split(" ")[1];

    // console.log( "Token: " + bearerToken);

    if (!bearerToken) {
        return res.status(422).json({ error: "No Token" });
    }

    // verfiy the token
    try {
        console.log("Token: " + bearerToken);
        var decode = jwt.verify(bearerToken, process.env.JWT_SECRET)

        // //setting email and role from decode
        const facultyEmail = decode.email;
        console.log(facultyEmail);
        const appData = await AppData.find().sort({ "updatedAt": -1 });

        var filteredData = new Array();
        const user = await User.find();
        for (let i = 0; i < user.length; i++) {
            if (user[i].role === "0") {
                if (facultyEmail === user[i].emailOfSupervisor) {
                    const appData = await AppData.find({ email: user[i].email });

                    // bug was here 
                    appData.forEach(element => {
                        filteredData.push(element);
                    });
                }
            }
        }
        return res.status(200).json({ data: filteredData });
    } catch (error) {
        console.log(error);
        return res.status(422).json({ error: error });
    }
})

module.exports = router;