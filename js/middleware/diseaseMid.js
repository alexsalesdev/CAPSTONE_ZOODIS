const db = require("../connection");

exports.addDisease = (req, res, next) => {

    let data = req.body;
    let diseaseName = data.strDiseaseName;
    let diseaseDesc = data.strDiseaseDesc;

    let symptoms = data.strSymptoms == null ? "" : data.strSymptoms == undefined ? "" : data.strSymptoms;

    symptoms += (data.symptoms0 == null || data.symptoms0 == undefined) ? "" : ":" + data.symptoms0;
    symptoms += (data.symptoms1 == null || data.symptoms1 == undefined) ? "" : ":" + data.symptoms1;
    symptoms += (data.symptoms2 == null || data.symptoms2 == undefined) ? "" : ":" + data.symptoms2;
    symptoms += (data.symptoms3 == null || data.symptoms3 == undefined) ? "" : ":" + data.symptoms3;
    symptoms += (data.symptoms4 == null || data.symptoms4 == undefined) ? "" : ":" + data.symptoms4;
    symptoms += (data.symptoms5 == null || data.symptoms5 == undefined) ? "" : ":" + data.symptoms5;
    symptoms += (data.symptoms6 == null || data.symptoms6 == undefined) ? "" : ":" + data.symptoms6;
    symptoms += (data.symptoms7 == null || data.symptoms7 == undefined) ? "" : ":" + data.symptoms7;
    symptoms += (data.symptoms8 == null || data.symptoms8 == undefined) ? "" : ":" + data.symptoms8;

    let checkDisease = function (cb) {
        let sql = "SELECT * FROM disease_t WHERE diseaseName = ?";
        db.get().query(sql, [diseaseName], (err, result) => {
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
        let sql1 = "INSERT INTO disease_t (diseaseName,diseaseDesc,symptoms) VALUES (?,?,?)";
        db.get().query(sql1, [diseaseName, diseaseDesc, symptoms], (err1, result1) => {
            console.log(symptoms);
            if (err1) return next(err1);

            res.status(200).send({ success: true, detail: "" });
        });
    }

    checkDisease((error, result) => {
        if (error) return next(error);

        if (result) {
            insertDisease();
        }
        else {
            res.status(200).send({ success: false, detail: "Data Already exists!" });
        }
    });
}

exports.diseaseList = (req, res, next) => {

    let sql2 = "SELECT * FROM disease_t";
    db.get().query(sql2,(err2,result2)=>{
        if(err2) return next(err2);

        res.status(200).send({success: true, detail:"", data:result2});
    });
}

exports.viewDisease = (req,res,next) => {
    
    console.log("here saview");
    let id = req.params.id;
    let data = req.body;

    let sql3 = "SELECT * FROM disease_t WHERE diseaseID = ?";
    db.get().query(sql3,[id],(err3,result3)=>{
        if(err3) return next(err3);

        let splittedSymptoms = result3[0].symptoms.split(":");
        let dataDisplay = {
            
            diseaseName     : result3[0].diseaseName,
            diseaseDesc     : result3[0].diseaseDesc,
            symptoms        : splittedSymptoms,
        }

        res.status(200).send({success: true, detail :"", data:dataDisplay});
    });
}
