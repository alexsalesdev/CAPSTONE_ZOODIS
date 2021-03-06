const db = require('../../connection');

/**
 *    This would search a piece of string for matching term on token array
 */
function search(token, strSearch, cb) {
    let matchCount = 0;

    token.forEach((element, index) => {
        let regexp = new RegExp(element, 'gi');
        let result = strSearch.match(regexp); // nagrereturn to ng null pag no match, then array if meron,
        if (result) { // si result is array, array ng matchs. soo yung bilang nila pag nag result.length ka we add it sa matchCount
            matchCount += result.length;
            console.log(matchCount,"ito yung matchCount ko");
        }
        if (index == token.length - 1) { // Para malaman natin kung ending na ba nung loop.
            cb(matchCount);
        }
    });
}

/** 
 *    we need to get the toxins of a bacteria,
 *    mag ququery ka dito. di to middleware :3
 */
function getBacteriaToxin(bacteria, cb) {

    let sql = "SELECT * FROM bacteriatoxin_t WHERE bacteriumID = ?";
    db.get().query(sql, [bacteria], (err, result) => {
        if (err) return cb(err);
        console.log(result,"getting bacteria toxin");
        cb(null, result);
    });
}

/**
 *   Get Toxins name.
 */
function getToxinName(toxinIDs, cb){
    let sql = "SELECT name FROM toxin_t WHERE toxinID = ?";
    var promises = [];
    toxinIDs.forEach((e,i)=>{
        promises.push(new Promise((resolve,reject)=>{
            var id = e.toxinID;
            db.get().query(sql, [id], function(err, result){
                if(err) reject(err);
                resolve(result[0].name);
            });
        }));
        if(i == toxinIDs.length-1){
            Promise.all(promises).then(results=>{
                console.log(results, "Getting toxin Names");
                cb(null, results)
            }).catch(reason=>{
                cb(new Error(reason));
            });
        }
    });
}

/**
 * Get Disease by page.
 * @param {Number} offset Start point
 * @param {Number} limit number of result to return
 * @param {Function} cb 
 */
function getDisease(offset, limit, cb){
    let sql = "SELECT diseaseID, diseaseName, diseaseDesc, bodySite FROM disease_t ORDER BY diseaseID ASC LIMIT ?,?";
    db.get().query(sql, [offset,limit], function(err, result){
        if(err) return cb(err);
        console.log(result,"i am getting disease");
        cb(null, result);
    });
}

/**
 * Process All Data and look for match, this is subject to change of algorithm, 
 * @param {String[]} toxinNames 
 * @param {Object[]} diseases 
 * @param {Function} cb 
 */
function processData(toxinNames, diseases, cb){
    console.log("AND2 ako sa process data");
    return new Promise((resolve, reject)=>{
        let matches = [];
        let promises = [];
        diseases.forEach((e,i)=>{
            promises.push(new Promise((resolve,reject)=>{
                var disease = e;
                search(toxinNames, disease.diseaseDesc, matchCount=>{
                    if(matchCount > 0){
                        matches.push(disease);
                        resolve(true);
                    }else{
                        resolve(true);
                    }
                });
            }));
            if(i == diseases.length-1){
                Promise.all(promises).then(()=>{
                    if(cb){
                        console.log(matches, "andito lahat ng matches");
                        cb(null, matches);
                    }else{
                        resolve(matches);
                    }
                }).catch(reason=>{
                    var err = new Error(reason);
                    if(cb){
                        cb(err);
                    }else{
                        reject(err);
                    }
                });
            }
        });
    });
}

function pathogenic(id, disease, cb){
    return new Promise((resolve, reject)=>{
        getBacteriaTissue(id).then(tissues=>{
            let output = [];
            output = tissues;
            return output;
        }).then(data=>{
            return new Promise((res,rej)=>{
                if(disease.length == 0) return res([]);
                let processed = [];
                let promises = [];
                disease.forEach((e,i)=>{
                    promises.push(new Promise((res1, rej1)=>{
                        data.forEach((tissue,index)=>{
                            if(tissue == e.bodySite){
                                processed.push(e);
                                res1();
                            }
                            if(data.length-1 == index){
                                res1();
                            }
                        });
                    }));
                    if(i==disease.length-1){
                        Promise.all(promises).then(()=>{
                            res(processed);
                        }).catch(rej);
                    }
                });
            }).then(output=>{
                if(output.length > 0) setPathogenetic(id, 1);
                if(output.length == 0) setPathogenetic(id, 0);
                let out = [];
                out = output;
                resolve(out);
            });
        }).catch(reason=>{
            return cb ? cb(reason) : reject(reason);
        });
    });
}

function getBacteriaTissue(id, cb){
    return new Promise((resolve, reject)=>{
        let sql = "SELECT bacteriumTissueSpecifity FROM bacteria_t WHERE bacteriumID = ?";
        db.get().query(sql, [id], function(err, result){
            if(err) return cb ? cb(err) : reject(err);
            var output = result[0].bacteriumTissueSpecifity.split(':');
            cb ? cb(null, output) : resolve(output);
        });
    });
}

function setPathogenetic(id, isPathogenic){
    let sql = "SELECT pathogenic FROM bacteria_t WHERE bacteriumID = ?";
    db.get().query(sql, [id], function(err, bacterium){
        if(err) return console.error(err);
        if(bacterium.length == 0) return console.log("No data found");
        if(isPathogenic != bacterium[0].pathogenic){
            sql = "UPDATE bacteria_t SET pathogenic = ? WHERE bacteriumID = ?";
            db.get().query(sql, [isPathogenic, id], function(err, result){
                if(err) return console.error(err);
            });
        }
    });
}

/**
 * we need to find the bacteriaID of user inputted string. eto talaga yung middleware
 */
exports.searchingBacteria = (req,res,next) =>{
    let data = req.body;
    let bacteria = data.bacteriaScientificName;
    let sql = "SELECT * FROM bacteria_t INNER JOIN bacteriataxo_t ON bacteria_t.bacteriumTaxoID = bacteriataxo_t.bacteriumTaxoID WHERE bacteriumScientificName = ?";
    let sql2 = "SELECT name,doi FROM journal_t WHERE journalID = ?";
    let sql3 = "SELECT animal_t.animalID,animalScientificName,animalName,image FROM animalbacteria_t INNER JOIN animal_t ON animal_t.animalID = animalbacteria_t.animalID WHERE animalbacteria_t.bacteriumID = ?"
    db.get().query(sql, [bacteria], (err, result) => {
        if (err) return next(err);
        res.locals.noRes = true;
        if(result.length == 0) return next();
        db.get().query(sql2,[result[0].journalID],(err2,result2)=>{
            if(err2) return next(err2);
            db.get().query(sql3,[result[0].bacteriumID],(err3,result3)=>{
                if(err3) return next(err3);
                if(result.length==0) return next();
                getBacteriaToxin(result[0].bacteriumID, (errr, toxinIDs) => {
                    if (errr) return next(errr);
                    getToxinName(toxinIDs, function(er, toxinNames){
                        if (er) return next(er);
                        let offset = 0;
                        let limit = 100;
                        getDisease(offset,limit, (e, disease)=>{
                            if(e) return next(e);
                            toxinNames.push(bacteria);
                            processData(toxinNames, disease).then(matches=>{
                                return pathogenic(result[0].bacteriumID, matches).then(output=>{
                                    return {
                                        match: output,
                                        bacteria: result[0],
                                        journal: result2[0],
                                        toxinNames: toxinNames,
                                        hosts : result3,
                                    }
                                });
                            }).then(output=>{
                                console.log(output.match);
                                res.locals.count = output.match.length;
                                res.locals.matchResult = output.match; 
                                res.locals.bacteria = output.bacteria;
                                res.locals.journal = output.journal;
                                res.locals.toxinNames = output.toxinNames;
                                res.locals.hosts = output.hosts;
                                res.locals.noRes = false;
                                next();

                            }).catch(reason=>{
                                throw (new Error(reason));
                            }).catch(reason=>{
                                next(reason);
                            });
                        });
                    });
                });
            });
        });
    });
}

exports.bacteriaModules = (req,res,next) =>{
    let status = 'approved';
    let sql = "SELECT bacteria_t.bacteriumID,animal_t.animalID,animalName,bacteriumScientificName,pathogenic,doi FROM animalbacteria_t INNER JOIN animal_t ON animalbacteria_t.animalbacteriaID = animal_t.animalID INNER JOIN bacteria_t ON animalbacteria_t.bacteriumID = bacteria_t.bacteriumID INNER JOIN journal_t ON journal_t.journalID = bacteria_t.journalID WHERE bacteria_t.status = ?";
    db.get().query(sql,[status],(err,result)=>{
        if (err) return next (err);

        res.status(200).send({success:true,detail:"",data:result});
    });
}

exports.viewBacteria = (req,res,next)=>{
    let id = req.query.bacteriumID;
    let sql = "SELECT * FROM bacteria_t INNER JOIN bacteriataxo_t ON bacteria_t.bacteriumTaxoID = bacteriataxo_t.bacteriumTaxoID WHERE bacteriumID = ?";
    let sql2 = "SELECT name,doi FROM journal_t WHERE journalID = ?";
    let sql3 = "SELECT animal_t.animalID,animalScientificName,animalName,image FROM animalbacteria_t INNER JOIN animal_t ON animal_t.animalID = animalbacteria_t.animalID WHERE animalbacteria_t.bacteriumID = ?"
    let sql4 = "SELECT * FROM toxin_t INNER JOIN bacteriatoxin_t ON toxin_t.toxinID = bacteriatoxin_t.toxinID WHERE bacteriatoxin_t.bacteriumID = ?";
    db.get().query(sql, [id], (err, result) => {
        if (err) return next(err);
        db.get().query(sql2,[result[0].journalID],(err2,result2)=>{
            if(err2) return next(err2);
            db.get().query(sql3,[result[0].bacteriumID],(err3,result3)=>{
                if(err3) return next(err3);
                db.get().query(sql4,[id],(err4,result4)=>{
                    let dataDisplay = {
                        stQuery : result[0],
                        ndQuery : result2[0],
                        rdQuery : result3,
                        thQuery : result4
                    }
                    res.locals = dataDisplay;
                    next();
                });
            });
        });
    });
}
exports.search = search; // Export search function, need to recycle on disease