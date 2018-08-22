const db = require('../../connection');

exports.notificationList = (req, res, next) => {
    let status = "pending";

    let sql = "SELECT * FROM notification_t WHERE status = ?";
    db.get().query(sql, [status], (err, result) => {
        if (err) return next(err);

        res.status(200).send({ success: true, detail: "", data: result });
    });
}

exports.viewAnimalTaxo = (req, res, next) => {
    let id = req.params.id;
    let sql = "SELECT * FROM animaltaxo_t WHERE animalTaxoID = ?";
    db.get().query(sql, [id], (err, result) => {
        if (err) return next(err);

        let dataDisplay = {
            phylum: result[0].phylum,
            classs: result[0].class,
            order: result[0].orderr,
            family: result[0].family,
            genus: result[0].genus,
            species: result[0].species,
        }

        res.status(200).send({ success: true, detail: "", data: dataDisplay });
    });
}

exports.approvedAnimalTaxo = (req, res, next) => {
    let id = req.params.id;
    let data = req.body;
    let phylum = data.matPhylum;
    let classs = data.matClass;
    let order = data.matOrder;
    let family = data.matFamily;
    let genus = data.matGenus;
    let species = data.matSpecies;
    let state = "noticed";
    let status = "approved";
    let category = "Animal Taxonomy"

    let sql = "UPDATE notification_t SET state=?, status=? WHERE category =? AND addedID =?";
    let sql1 = "UPDATE animaltaxo_t SET phylum=?, class=?, orderr=?, family=?, genus=?, species=?, status=? WHERE animalTaxoID = ?";
    db.get().query(sql, [state, status, category, id], (err, result) => {
        if (err) return next(err);
        db.get().query(sql1, [phylum, classs, order, family, genus, species, status, id], (err1, result1) => {
            if (err1) return next(err1);

            res.status(200).send({ success: true, detail: "Successfully Approved!" });
        });
    });
}

exports.rejectAnimalTaxo = (req, res, next) => {
    let id = req.params.id;
    let data = req.body;
    let status = "rejected";
    let state = "noticed";
    let category = "Animal Taxonomy";
    let reasons = data.reasons;

    let sql = "UPDATE notification_t SET state=?, status=? ,message =? WHERE addedID =? AND category =?";
    let sql1 = "UPDATE animaltaxo_t SET status = ? WHERE animalTaxoID = ?";
    db.get().query(sql, [state, status, reasons, id, category], (err, result) => {
        if (err) return next(err);
        db.get().query(sql1, [status, id], (err1, result1) => {
            if (err1) return next(err1);

            res.status(200).send({ success: true, detail: "Data Rejected!" });
        });
    });
}

exports.viewBacteriaTaxo = (req, res, next) => {
    let id = req.params.id;
    let sql = "SELECT * FROM bacteriataxo_t WHERE bacteriumTaxoID = ?";
    db.get().query(sql, [id], (err, result) => {
        if (err) return next(err);

        let dataDisplay = {
            phylum: result[0].phylum,
            classs: result[0].class,
            order: result[0].orderr,
            family: result[0].family,
            genus: result[0].genus,
            species: result[0].species,
        }

        res.status(200).send({ success: true, detail: "", data: dataDisplay });
    });
}

exports.approvedBacteriaTaxo = (req, res, next) => {
    let id = req.params.id;
    let data = req.body;
    let phylum = data.mbtPhylum;
    let classs = data.mbtClass;
    let order = data.mbtOrder;
    let family = data.mbtFamily;
    let genus = data.mbtGenus;
    let species = data.mbtSpecies;
    let state = "noticed";
    let status = "approved";
    let category = "Bacteria Taxonomy"

    let sql = "UPDATE notification_t SET state=?, status=? WHERE category =? AND addedID =?";
    let sql1 = "UPDATE bacteriataxo_t SET phylum=?, class=?, orderr=?, family=?, genus=?, species=?, status=? WHERE bacteriumTaxoID = ?";
    db.get().query(sql, [state, status, category, id], (err, result) => {
        if (err) return next(err);
        db.get().query(sql1, [phylum, classs, order, family, genus, species, status, id], (err1, result1) => {
            if (err1) return next(err1);

            res.status(200).send({ success: true, detail: "Successfully Approved!" });
        });
    });
}

exports.rejectBacteriaTaxo = (req, res, next) => {
    let id = req.params.id;
    let data = req.body;
    let status = "rejected";
    let state = "noticed";
    let category = "Bacteria Taxonomy";
    let reasons = data.reasons;

    let sql = "UPDATE notification_t SET state=?, status=? ,message =? WHERE addedID =? AND category =?";
    let sql1 = "UPDATE bacteriataxo_t SET status = ? WHERE bacteriumTaxoID = ?";
    db.get().query(sql, [state, status, reasons, id, category], (err, result) => {
        if (err) return next(err);
        db.get().query(sql1, [status, id], (err1, result1) => {
            if (err1) return next(err1);

            res.status(200).send({ success: true, detail: "Data Rejected!" });
        });
    });
}

exports.selectBacteria = (req, res, next) => {

    let sql = "SELECT bacteriumID, bacteriumScientificName FROM bacteria_t";
    db.get().query(sql, (err, result) => {
        if (err) return next(err);

        res.status(200).send({ success: true, detail: "", data: result });
    });
}

exports.viewToxin = (req, res, next) => {
    let id = req.params.id;
    let sql = "SELECT * FROM `bacteriatoxin_t` LEFT JOIN toxin_t ON bacteriatoxin_t.toxinID = toxin_t.toxinID LEFT JOIN bacteria_t ON bacteriatoxin_t.bacteriumID = bacteria_t.bacteriumID WHERE toxin_t.toxinID = ?";
    db.get().query(sql, [id], (err, result) => {
        if (err) return next(err);

        dataDisplay = {
            bacteriumID: result[0].bacteriumID,
            name: result[0].name,
            feature: result[0].structureFeature,
            functionn: result[0].function,
        }

        res.status(200).send({ success: true, detail: "", data: dataDisplay });
    });
}

exports.approvedToxin = (req, res, next) => {
    let id = req.params.id;
    let data = req.body;
    let bacteriumID = data.selectBToxin;
    let toxin = data.toxin;
    let sctructureFeature = data.sctructureFeature;
    let functionn = data.functionn;
    let status = "approved";
    let state = "noticed";
    let category = "Toxin";

    let sql = "UPDATE notification_t SET state=?, status=? WHERE category =? AND addedID =?";
    let sql1 = "UPDATE toxin_t SET name = ?, structureFeature = ?, function = ?, status =?  WHERE toxinID = ?";
    let sql2 = "UPDATE bacteriatoxin_t SET bacteriumID = ? , toxinID = ? WHERE toxinID = ?";
    db.get().query(sql, [state, status, category, id], (err, result) => {
        if (err) return next(err);
        db.get().query(sql1, [toxin, sctructureFeature, functionn, status, id], (err1, return1) => {
            if (err1) return next(err1);
            db.get().query(sql2, [bacteriumID, id, id], (err2, result2) => {
                if (err2) return next(err2);

                res.status(200).send({ success: true, detail: "Successfully Approved!" });

            });
        });

    });
}

exports.rejectToxin = (req, res, next) => {

    let id = req.params.id;
    let data = req.body;
    let reasons = data.reasons;
    let category = "Toxin";
    let status = "rejected";
    let state = "noticed";

    let sql = "UPDATE notification_t SET state=?, status=?, message=? WHERE category =? AND addedID =?";
    let sql1 = "UPDATE toxin_t SET status =?  WHERE toxinID = ?";
    db.get().query(sql, [state, status, reasons, category , id], (err, result) => {
        if (err) return next(err);
        db.get().query(sql1, [status, id], (err1, return1) => {
            if (err1) return next(err1);

            res.status(200).send({ success: true, detail: "Successfully Approved!" });

        });
    });
}

exports.viewDisease = (req,res,next) =>{
    let id = req.params.id;
    let data = req.body;

    let sql3 = "SELECT * FROM disease_t INNER JOIN bacteriadisease_t ON disease_t.diseaseID = bacteriadisease_t.diseaseID INNER JOIN bacteria_t ON bacteriadisease_t.bacteriumID = bacteria_t.bacteriumID WHERE disease_t.diseaseID = ?";
    db.get().query(sql3,[id],(err3,result3)=>{
        if(err3) return next(err3);

        let splittedSymptoms = result3[0].symptoms.split(":");
        console.log(splittedSymptoms);
        let dataDisplay = {
            
            bacteriumID     : result3[0].bacteriumID,
            bacteriumName   : result3[0].bacteriumScientificName,
            diseaseName     : result3[0].diseaseName,
            diseaseDesc     : result3[0].diseaseDesc,
            symptoms        : splittedSymptoms,
        }

        res.status(200).send({success: true, detail :"", data:dataDisplay});
    });
}

exports.approvedDisease = (req,res,next) =>{
    let id = req.params.id;
    let data = req.body;
    let bacteriumID = data.selectBacteria1;
    let status = "approved";
    let state = "noticed";
    let category = "Disease";
    let sql = "UPDATE disease_t SET diseaseName = ?, diseaseDesc = ?, symptoms = ?,status=? WHERE diseaseID = ?";
    let sql1 = "UPDATE bacteriadisease_t SET bacteriumID =? , diseaseID =? WHERE diseaseID = ?";
    let sql2 = "UPDATE notification_t SET state =?,status =? WHERE category =? AND addedID =? "
    let error = 0;

    //Some validations here... 
    let queryData = [];
    queryData.push(data.modalName);
    queryData.push(data.modalDesc);
    queryData.push(data.symptoms);
    queryData.push("approved");
    queryData.push(id);

    queryData.forEach((e)=>{
        if(e==undefined || e==null){
            error++;
        }
    });

    if(error == 0){
        db.get().query(sql, queryData, function(err, result){
            if(err) return next(err);
            db.get().query(sql1,[bacteriumID,id,id],(err1, result1)=>{
                if(err1) return next(err1);
                db.get().query(sql2,[state,status,category,id],(err2,result2)=>{
                    if(err2) return next(err2);
                    res.status(200).send({success: true, detail: "Successfully Approved"});
                });
            });
        });
    }else{
        res.status(200).send({success: false, detail: "Invalid Data"});
    }
}

exports.rejectDisease = (req, res, next) => {

    let id = req.params.id;
    let data = req.body;
    let reasons = data.reasons;
    let category = "Disease";
    let status = "rejected";
    let state = "noticed";

    let sql = "UPDATE notification_t SET state=?, status=?, message=? WHERE category =? AND addedID =?";
    let sql1 = "UPDATE disease_t SET status =?  WHERE diseaseID = ?";
    db.get().query(sql, [state, status, reasons, category , id], (err, result) => {
        if (err) return next(err);
        db.get().query(sql1, [status, id], (err1, return1) => {
            if (err1) return next(err1);

            res.status(200).send({ success: true, detail: "Successfully Approved!" });

        });
    });
}
