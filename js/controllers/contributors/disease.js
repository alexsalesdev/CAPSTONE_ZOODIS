const db = require("../../connection");

exports.addDisease = (req, res, next) => {

    let data = req.body;
    let diseaseName = data.strDiseaseName;
    let diseaseDesc = data.strDiseaseDesc;
    let status = "pending";
    let name = req.session.staffData.firstName + " " + req.session.staffData.lastName;
    let symptoms = /* data.strSymptoms == null ? "" : data.strSymptoms == undefined ? "" : data.strSymptoms */ "";
    let category = 'Disease';
    let bodySite = /* data.strBody == null ? "" : data.strBody == undefined ? "" : data.strBody */ "";
    let state = "notify";

    if(Array.isArray(data["symptoms[]"])){
        data["symptoms[]"].forEach(element => {
            symptoms += element + ":";
        });
    }else{
        symptoms = data["symptoms[]"];
    }
    if(Array.isArray(data["site[]"])){
        data["site[]"].forEach(element=>{
            bodySite += element + ":";
        });
    }else{
        bodySite = data["site[]"];
    }

    // symptoms += (data.symptoms0 == null || data.symptoms0 == undefined) ? "" : ":" + data.symptoms0;
    // symptoms += (data.symptoms1 == null || data.symptoms1 == undefined) ? "" : ":" + data.symptoms1;
    // symptoms += (data.symptoms2 == null || data.symptoms2 == undefined) ? "" : ":" + data.symptoms2;
    // symptoms += (data.symptoms3 == null || data.symptoms3 == undefined) ? "" : ":" + data.symptoms3;
    // symptoms += (data.symptoms4 == null || data.symptoms4 == undefined) ? "" : ":" + data.symptoms4;
    // symptoms += (data.symptoms5 == null || data.symptoms5 == undefined) ? "" : ":" + data.symptoms5;
    // symptoms += (data.symptoms6 == null || data.symptoms6 == undefined) ? "" : ":" + data.symptoms6;
    // symptoms += (data.symptoms7 == null || data.symptoms7 == undefined) ? "" : ":" + data.symptoms7;
    // symptoms += (data.symptoms8 == null || data.symptoms8 == undefined) ? "" : ":" + data.symptoms8;

    // bodySite += (data.bodyName0 == null || data.bodyName == undefined) ? "" : ":" + data.bodyName;
    // bodySite += (data.bodyName1 == null || data.bodyName == undefined) ? "" : ":" + data.bodyName;
    // bodySite += (data.bodyName2 == null || data.bodyName == undefined) ? "" : ":" + data.bodyName;
    // bodySite += (data.bodyName3 == null || data.bodyName == undefined) ? "" : ":" + data.bodyName;
    // bodySite += (data.bodyName4 == null || data.bodyName == undefined) ? "" : ":" + data.bodyName;
    // bodySite += (data.bodyName5 == null || data.bodyName == undefined) ? "" : ":" + data.bodyName;
    // bodySite += (data.bodyName6 == null || data.bodyName == undefined) ? "" : ":" + data.bodyName;
    // bodySite += (data.bodyName7 == null || data.bodyName == undefined) ? "" : ":" + data.bodyName;
    // bodySite += (data.bodyName8 == null || data.bodyName == undefined) ? "" : ":" + data.bodyName;

    let checkDisease = function (cb) {
        let sql = "SELECT diseaseName, disease_t.journalID FROM disease_t INNER JOIN journal_t ON journal_t.journalID = disease_t.journalID WHERE diseaseName = ? AND disease_t.journalID = ?";
        db.get().query(sql, [diseaseName,req.session.staffData.journalID], (err, result) => {
            if (err) return cb(err);

            if (result.length == 0) {
                return cb(null, true);
            }
            else {
                return cb(null, false);
            }
        });
    }
    
    let insertDisease = function () {
        let sql1 = "INSERT INTO disease_t (bodySite,diseaseName,diseaseDesc,symptoms,journalID,status,staffID,dateTime) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)";
        let sql = "INSERT INTO request_t (dateTime, status, staffName, addedData, staffID, category,addedID,state,assignID) VALUES (CURRENT_TIMESTAMP,?,?,?,?,?,?,?,?)";
        db.get().query(sql1, [bodySite,diseaseName, diseaseDesc, symptoms,req.session.staffData.journalID,status,req.session.staffID], (err1, result1) => {
            if(err1) return next(err1);
            db.get().query(sql, [ status, name, diseaseName, req.session.staffID, category,result1.insertId,state,req.session.staffData.journalID],(err2, result2) => {
                if (err2) return next(err2);
                res.status(200).send({success: true, detail: ""}); 
            });    
        });
    }

    checkDisease((error, result) => {
        if (error) return next(error);

        if (result) {
            insertDisease();
        }
        else {
            res.status(200).send({ success: false, detail: "Data Already Exists!" });
        }
    });
}

exports.diseaseList = (req,res,next) =>{

    let sql = "SELECT * FROM disease_t WHERE staffID = ?";
    db.get().query(sql,[req.session.staffID],(err,result)=>{
        if(err) return next(err);

        res.status(200).send({success:true, detail:"", data:result});
    });
}

exports.viewDisease = (req,res,next) => {
    let id = req.params.id;
    let data = req.body;

    let sql = "SELECT *,disease_t.status FROM disease_t INNER JOIN journal_t ON journal_t.journalID = disease_t.journalID WHERE disease_t.diseaseID = ?";
    db.get().query(sql,[id],(err,result)=>{
        if(err) return next(err);

        let splittedSymptoms = result[0].symptoms.split(":");
        let dataDisplay = {
            
            bacteriumID     : result[0].bacteriumID,
            bacteriumName   : result[0].bacteriumScientificName,
            diseaseName     : result[0].diseaseName,
            diseaseDesc     : result[0].diseaseDesc,
            title           : result[0].name,
            status          : result[0].status,
            symptoms        : splittedSymptoms,
        }

        res.status(200).send({success: true, detail :"", data:dataDisplay});
    });
}