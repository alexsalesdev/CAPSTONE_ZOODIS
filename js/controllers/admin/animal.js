const db = require("../../connection");

exports.addAnimal = (req, res, next) => {    
    let image = req.file.path;
    let data = req.body;
    let commonName = data.strCommonName+"";
    let scientificName = data.strScientificName+"";
    let finalScienctific = scientificName.split(' ');
    let genusName = finalScienctific[0];
    let scienceName = data.strScientificName+"";
    let speciesName = finalScienctific[1];
    let bodySite = data.strBodySite;
    let isInserting = data.isInserting;
    
    if (!req.file) {
        res.status(200).send({ success: false, detail: "No Image Provide" });
        return;
    }
    
    /**
     * This function: ichecheck kung existing na ba yung ilalagay ng user sa may database
     * @param cb Callback function
     */
    let checkAnimal = function (cb) {
        let sql = "SELECT * FROM animal_t WHERE animalName =? AND animalScientificName = ?";
        db.get().query(sql, [commonName, scienceName], (err, result) => {
            if (err) return cb(err);
            if (result.length == 0) {
                return cb(null, true);
            }
            else {
                return cb(null, false);
            }
        });
    };

    /**
     * This function run when no species provided in the scientific name, 
     * also return set of suggestion to the client if ever a non-existing genus is provided.
     */
    let noGenus = function () {
        //kapag walang prinovide yung user ng species
        speciesName = "spp.";
        let sql = "SELECT animalTaxoID, phylum, class, orderr, family, genus FROM animaltaxo_t WHERE genus = ?";
        db.get().query(sql, [genusName], (err, result) => { //pagkuha ng result ng taxo classification by a genus
            if (err) return next(err);

            if (result.length == 0) {
                res.status(200).send({ success: false, detail: "Genus not found", error: 1 });
            }
            else {
                insertAnimal(result);
            }
        });
    };

    /**
     * This Function: iinsert na ng system sa database yung ininput ng User
     * @param result ResultSet object, containing taxonomy of the animal.
     */
    let insertAnimal = function (result) {
        let sql3 = "INSERT INTO animal_t (animalName, animalScientificName, animalBodySite, animalTaxoID,image) VALUES (?,?,?,?,?)";
        let dataDisplay = {
            commonName: commonName,
            scientificName: scientificName,
            bodySite: bodySite,
            phylum: result[0].phylum,
            class: result[0].class,
            order: result[0].orderr,
            family: result[0].family,
            genus: result[0].genus,
            species: speciesName,
            image   : image
        };

        if (isInserting) {
            db.get().query(sql3, [commonName, genusName + ' ' + speciesName, bodySite, result[0].animalTaxoID,image], (error, result3) => {
                if (error) return next(error);

                res.status(200).send({ success: true, detail: "Successfully Added!", });
            });
        }

        else {
            res.status(200).send({ success: true, detail: "", data: dataDisplay });
        }
    };

    checkAnimal((error, result) => {
        if (error) return next(error);
        if (result) {
            if (scientificName.length > 1) {
                if (speciesName == "spp") {
                    noGenus();
                }
                else {

                    //kapag kumpleto yung scientific name 
                    let sql = "SELECT * FROM animaltaxo_t WHERE species = ?";
                    db.get().query(sql, [speciesName], (err, result) => { //pagkuha ng result ng taxo classification by a species
                        if (err) return next(err);

                        if (result.length == 0) {
                            res.status(200).send({ success: false, detail: "Species not found", error: 2});
                        }
                        else {
                            insertAnimal(result);
                        }
                    });
                }
            }
            else {
                noGenus();
            }
        }
        else {
            res.status(200).send({ success: false, error: 3, detail: "Data Already Exists" });
        }
    });
};

exports.addAnimalTaxon = (req, res, next) => {

    let data = req.body;

    let strPhylum = data.strPhylum;
    let strClass = data.strClass;
    let strOrder = data.strOrder;
    let strFamily = data.strFamily;
    let strGenus = data.strGenus;
    let strSpecies = data.strSpecies;

    let insertAnimalTaxon = function () {
        let sql4 = "INSERT INTO animaltaxo_t (phylum, class, orderr, family, genus, species) VALUES (?,?,?,?,?,?)";
        db.get().query(sql4, [strPhylum, strClass, strOrder, strFamily, strGenus, strSpecies], (err4, result4) => {
            if (err4) return next(err4);

            res.status(200).send({ success: true, detail: "Successfully Added!", data: result4 });
        });
    }

    let checkAnimalTaxon = function (cb) {
        let sql5 = "SELECT * FROM animaltaxo_t WHERE species = ?";
        db.get().query(sql5, [strSpecies], (err5, result5) => {
            if (err5) return cb(err5);

            if (result5.length == 0) {
                return cb(null, true);
            }

            else {
                return cb(null, false);
            }
        });
    }

    checkAnimalTaxon((error, result) => {
        if (error) return next(error);

        if (result) {
            insertAnimalTaxon();
        }
        else {
            res.status(200).send({ success: false, detail: "Data Already exists!" });
        }

    });





};

exports.animalTaxonList = (req, res, next) => {

    let sql6 = "SELECT * FROM animaltaxo_t";
    db.get().query(sql6, (err6, result6) => {
        if (err6) return next(err6);

        res.status(200).send({ success: true, details: "", data: result6 });
    });

}

exports.editAnimalTaxon = (req, res, next) => {

    let id = req.params.id;

    let sql7 = "SELECT * FROM animaltaxo_t WHERE animalTaxoID = ?";
    db.get().query(sql7, [id], (err7, result7) => {
        if (err7) return next(err7);

        let dataDisplay = {
            id: result7[0].animalTaxoID,
            phylum: result7[0].phylum,
            class: result7[0].class,
            order: result7[0].orderr,
            family: result7[0].family,
            genus: result7[0].genus,
            species: result7[0].species,
        }

        res.status(200).send({ success: true, detail: "", data: dataDisplay });
    });

}

exports.updateAnimalTaxon = (req, res, next) => {

    let id = req.params.id;
    let data = req.body;

    let strPhylum = data.modalPhylum;
    let strClass = data.modalClass;
    let strOrder = data.modalOrder;
    let strFamily = data.modalFamily;
    let strGenus = data.modalGenus;
    let strSpecies = data.modalSpecies;

    let sql8 = "UPDATE animaltaxo_t SET phylum = ?, class =?, orderr = ?, family =?,genus=?, species=? WHERE animalTaxoID = ?";
    db.get().query(sql8, [strPhylum, strClass, strOrder, strFamily, strGenus, strSpecies, id], (err8, result8) => {
        if (err8) return next(err8);

        res.status(200).send({ success: true, detail: "Successfully Updated!" });
    });
};

exports.animalList = (req,res,next) =>{
    let sql = "SELECT * FROM animal_t";
    db.get().query(sql,(err,result) =>{
        if(err) return next(err);

        res.status(200).send({success:true, detail:"", data:result});

    });
}

exports.viewAnimal = (req,res,next) =>{

    console.log("im here na");
    let id = req.params.id;

    let sql = "SELECT * FROM animal_t INNER JOIN animaltaxo_t ON animal_t.animalTaxoID = animaltaxo_t.animalTaxoID WHERE animalID = ?";
    db.get().query(sql,[id],(err,result)=>{
        if(err) return next(err);

        let dataDisplay = {
            animalName              :   result[0].animalName,
            animalScientificName    :   result[0].animalScientificName,
            bodySite                :   result[0].animalBodySite,
            phylum                  :   result[0].phylum,
            classs                  :   result[0].class,
            order                   :   result[0].orderr,
            family                  :   result[0].family,
            genus                   :   result[0].genus,
            species                 :   result[0].species,
            image                   :   result[0].image
        }

        res.status(200).send({success:true, detail:"", data:dataDisplay});
    });
   
}

exports.updateAnimal = function(req, res, next){
    if (!req.file) {
        res.status(200).send({ success: false, detail: "No Image Provide" });
        return;
    }

    let image = req.file.path;
    let data = req.body;
    let commonName = data.modalCommonName+"";
    let scientificName = data.modalScientificName+"";
    let finalScienctific = scientificName.split(' ');
    let genusName = finalScienctific[0];
    let scienceName = data.strScientificName+"";
    let speciesName = finalScienctific[finalScienctific.length-1];
    let bodySite = data.modalBodySite;
    let isInserting = 1;
    
    /**
     * This function: ichecheck kung existing na ba yung ilalagay ng user sa may database
     * @param cb Callback function
     */
    let checkAnimal = function (cb) {
        let sql = "SELECT * FROM animal_t WHERE animalName =? AND animalScientificName = ?";
        db.get().query(sql, [commonName, scienceName], (err, result) => {
            if (err) return cb(err);
            if (result.length == 0) {
                return cb(null, true);
            }
            else {
                return cb(null, false);
            }
        });
    };

    /**
     * This function run when no species provided in the scientific name, 
     * also return set of suggestion to the client if ever a non-existing genus is provided.
     */
    let noGenus = function () {
        //kapag walang prinovide yung user ng species
        speciesName = "spp.";
        let sql = "SELECT animalTaxoID, phylum, class, orderr, family, genus FROM animaltaxo_t WHERE genus = ?";
        db.get().query(sql, [genusName], (err, result) => { //pagkuha ng result ng taxo classification by a genus
            if (err) return next(err);

            if (result.length == 0) {
                res.status(200).send({ success: false, detail: "Genus not found", error: 1 });
            }
            else {
                insertAnimal(result);
            }
        });
    };

    /**
     * This Function: iinsert na ng system sa database yung ininput ng User
     * @param result ResultSet object, containing taxonomy of the animal.
     */
    let insertAnimal = function (result) {
        let sql3 = "UPDATE animal_t SET animalName = ?, animalScientificName = ?, animalBodySite = ?, animalTaxoID = ?,image = ? WHERE animalID = ?";
        let dataDisplay = {
            commonName: commonName,
            scientificName: scientificName,
            bodySite: bodySite,
            phylum: result[0].phylum,
            class: result[0].class,
            order: result[0].orderr,
            family: result[0].family,
            genus: result[0].genus,
            species: speciesName,
            image   : image
        };

        if (isInserting) {
            db.get().query(sql3, [commonName, genusName + ' ' + speciesName, bodySite, result[0].animalTaxoID, image, req.params.id], (error, result3) => {
                if (error) return next(error);

                res.status(200).send({ success: true, detail: "Successfully Added!", });
            });
        }

        else {
            res.status(200).send({ success: true, detail: "", data: dataDisplay });
        }
    };

    checkAnimal((error, result) => {
        if (error) return next(error);
        if (result) {
            if (scientificName.length > 1) {
                if (speciesName == "spp") {
                    noGenus();
                }
                else {

                    //kapag kumpleto yung scientific name 
                    let sql = "SELECT * FROM animaltaxo_t WHERE species = ?";
                    db.get().query(sql, [speciesName], (err, result) => { //pagkuha ng result ng taxo classification by a species
                        if (err) return next(err);
                        if (result.length == 0) {
                            res.status(200).send({ success: false, detail: "Species not found", error: 2});
                        }
                        else {
                            insertAnimal(result);
                        }
                    })
                }
            }
            else {
                noGenus();
            }
        }
        else {
            res.status(200).send({ success: false, error: 3, detail: "Data Already Exists" });
        }
    });
}