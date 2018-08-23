$(function () {
    notificationList();
    selectBacteria();
    selectDisease();
    selectAnimal();

    $('.toApprove').hide();
    $('.toApprove1').hide();
    $('.toReject1').hide();
    $('.toReject').hide();
    $('.searchAnimal').autocomplete({
        source: (req, res) => {
            $.ajax({
                type: "GET",
                url: "/search/animal/?data=" + req.term,
                success: function (response) {
                    res(response.data);
                },
                error: function (response) {
                    console.log(response.detail);
                },
            });
        },
    });

});
isClicked = 0;
function notificationList() {
    $.get("/notificationList", (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }

        let data = response.data;

        let html = "";
        data.forEach((element, index) => {
            let row = "<tr>";
            row += "<td>" + element.dateTime + "</td>";
            row += "<td>" + element.staffName + "</td>";
            row += "<td>" + element.addedData + "</td>";
            row += "<td>" + element.category + "</td>";
            if (element.category === "Bacteria") {
                row += "<td><a data-toggle='modal' href='#modalBacteria'><button onclick ='viewBacteria(" + element.addedID + ")' type='button' rel='tooltip' class='btn btn-info btn-icon btn-sm'><i class='now-ui-icons ui-2_settings-90'></i></button></a>&nbsp;</td>";
            }
            else if (element.category === "Animal") {
                row += "<td><a data-toggle='modal' href='#modalAnimal'><button onclick ='viewAnimal(" + element.addedID + ")' type='button' rel='tooltip' class='btn btn-info btn-icon btn-sm'><i class='now-ui-icons ui-2_settings-90'></i></button></a>&nbsp;</td>";
            }
            else if (element.category === "Toxin") {
                row += "<td><a data-toggle='modal' href='#modalToxins'><button onclick ='viewToxin(" + element.addedID + ")' type='button' rel='tooltip' class='btn btn-info btn-icon btn-sm'><i class='now-ui-icons ui-2_settings-90'></i></button></a>&nbsp;</td>";
            }
            else if (element.category === "Disease") {
                row += "<td><a data-toggle='modal' href='#modalDisease'><button onclick ='viewDisease(" + element.addedID + ")' type='button' rel='tooltip' class='btn btn-info btn-icon btn-sm'><i class='now-ui-icons ui-2_settings-90'></i></button></a>&nbsp;</td>";
            }
            else if (element.category === "Prevention") {
                row += "<td><a data-toggle='modal' href='#modalPreventions'><button onclick ='viewPrevention(" + element.addedID + ")' type='button' rel='tooltip' class='btn btn-info btn-icon btn-sm'><i class='now-ui-icons ui-2_settings-90'></i></button></a>&nbsp;</td>";
            }
            else if (element.category === "Animal Taxonomy") {
                row += "<td><a data-toggle='modal' href='#modalAnimalTaxo'><button onclick ='viewAnimalTaxo(" + element.addedID + ")' type='button' rel='tooltip' class='btn btn-info btn-icon btn-sm'><i class='now-ui-icons ui-2_settings-90'></i></button></a>&nbsp;</td>";
            }
            else {
                row += "<td><a data-toggle='modal' href='#modalBacteriaTaxo'><button onclick ='viewBacteriaTaxo(" + element.addedID + ")' type='button' rel='tooltip' class='btn btn-info btn-icon btn-sm'><i class='now-ui-icons ui-2_settings-90'></i></button></a>&nbsp;</td>";
            }

            row += "</tr>";
            html += row;
        });
        $('#notificationList').html(html);
        $('#notificationTable').dataTable();
    });
}

let viewAnimalTaxoID = 0;
function viewAnimalTaxo(id) {
    viewAnimalTaxoID = id;
    let url = "/notificationViewAnimalTaxo/" + viewAnimalTaxoID;
    console.log(url);
    $.get(url, (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }

        $('input[name=matPhylum]').val(response.data.phylum);
        $('input[name=matClass]').val(response.data.classs);
        $('input[name=matOrder]').val(response.data.order);
        $('input[name=matFamily]').val(response.data.family);
        $('input[name=matGenus]').val(response.data.genus);
        $('input[name=matSpecies]').val(response.data.species);
    });
}

function approvedAnimalTaxo(eAdd) {
    eAdd.preventDefault();
    if (isClicked != 0) {
        return;
    }
    isClicked++;

    let url = "/approvedAnimalTaxo/" + viewAnimalTaxoID;
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};
    console.log(url);

    let data = $("#modalAnimalTaxoForm").serializeArray();

    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        if (element.value == "") {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[0-9*#\/]/g) != null) {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            dataInsert[element.name] = element.value;
        }

    });

    if (errCount > 0) {
        $.notify("All fields must be filled!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        isClicked = 0;
        swal({
            title: 'Approved Animal Taxon',
            text: "Are you sure?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes'
        }).then((isConfirmed) => {
            if (isConfirmed) {
                $.post(url, dataInsert, function (response) {
                    if (response.success == false) {
                        swal({
                            title: "Error!",
                            text: "Data Already Exists!",
                            type: "error",
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Okay"
                        });
                    }

                    else {
                        swal({
                            title: "Done!",
                            text: response.detail,
                            type: "success",
                            confirmButtonColor: "#9c27b0",
                            confirmButtonText: "Okay"
                        });
                        $("#modalAnimalTaxo").modal('hide');
                        notificationList();
                    }
                });
            }
        })
    }
}

function rejectAnimalTaxo() {
    if (isClicked != 0) {
        return;
    }
    isClicked++;
    swal({
        title: 'Reject Animal Taxon',
        text: "Are you sure?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes'
    }).then((isConfirmed) => {
        if (isConfirmed) {
            $("#reasonsAnimalTaxo").modal('show');
            sendReasonAnimalTaxo();
        }
        else {
            $("#modalAnimalTaxo").modal('hide');
        }
    })
}

function sendReasonAnimalTaxo() {

    let url = "/rejectAnimalTaxo/" + viewAnimalTaxoID;
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};

    console.log(url);
    let data = $("#reasonsAnimalForm").serializeArray();
    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        if (element.value == "") {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[0-9*#\/]/g) != null) {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            dataInsert[element.name] = element.value;
        }

    });

    if (errCount > 0) {
        $.notify("Provide Reasons of Rejecting!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        $.post(url, dataInsert, function (response) {
            if (response.success == false) {
                swal({
                    title: "Error!",
                    text: "Error sending!",
                    type: "error",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Okay"
                });
            }

            else {
                swal({
                    title: "Done!",
                    text: response.detail,
                    type: "success",
                    confirmButtonColor: "#9c27b0",
                    confirmButtonText: "Okay"
                });
                $("#modalAnimalTaxo").modal('hide');
                $("#reasonsAnimalTaxo").modal('hide');
                notificationList();
            }
        });
    }
}

let viewBacteriaTaxoID = 0;
function viewBacteriaTaxo(id) {
    viewBacteriaTaxoID = id;
    let url = "/notificationViewBacteriaTaxo/" + viewBacteriaTaxoID;
    console.log(url);
    $.get(url, (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }
        $('input[name=mbtPhylum]').val(response.data.phylum);
        $('input[name=mbtClass]').val(response.data.classs);
        $('input[name=mbtOrder]').val(response.data.order);
        $('input[name=mbtFamily]').val(response.data.family);
        $('input[name=mbtGenus]').val(response.data.genus);
        $('input[name=mbtSpecies]').val(response.data.species);
    });
}

function approvedBacteriaTaxo(eAdd) {
    eAdd.preventDefault();
    if (isClicked != 0) {
        return;
    }
    isClicked++;

    let url = "/approvedBacteriaTaxo/" + viewBacteriaTaxoID;
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};
    console.log(url);

    let data = $("#modalBacteriaTaxoForm").serializeArray();

    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        if (element.value == "") {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[0-9*#\/]/g) != null) {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            dataInsert[element.name] = element.value;
        }

    });

    if (errCount > 0) {
        $.notify("All fields must be filled!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        isClicked = 0;
        swal({
            title: 'Approved Bacteria Taxon',
            text: "Are you sure?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes'
        }).then((isConfirmed) => {
            if (isConfirmed) {
                $.post(url, dataInsert, function (response) {
                    if (response.success == false) {
                        swal({
                            title: "Error!",
                            text: "Data Already Exists!",
                            type: "error",
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Okay"
                        });
                    }

                    else {
                        swal({
                            title: "Done!",
                            text: response.detail,
                            type: "success",
                            confirmButtonColor: "#9c27b0",
                            confirmButtonText: "Okay"
                        });
                        $("#modalBacteriaTaxo").modal('hide');
                        notificationList();
                    }
                });
            }
        })
    }
}

function rejectBacteriaTaxo() {
    if (isClicked != 0) {
        return;
    }
    isClicked++;
    swal({
        title: 'Reject Bacteria Taxon',
        text: "Are you sure?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes'
    }).then((isConfirmed) => {
        if (isConfirmed) {
            $("#reasonsBacteriaTaxo").modal('show');
            sendReasonBacteriaTaxo();
        }
        else {
            $("#modalBacteriaTaxo").modal('hide');
        }
    })
}

function sendReasonBacteriaTaxo() {

    let url = "/rejectBacteriaTaxo/" + viewBacteriaTaxoID;
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};

    console.log(url);
    let data = $("#reasonsBacteriaForm").serializeArray();
    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        if (element.value == "") {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[0-9*#\/]/g) != null) {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            dataInsert[element.name] = element.value;
        }

    });

    if (errCount > 0) {
        $.notify("Provide Reasons of Rejecting!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        $.post(url, dataInsert, function (response) {
            if (response.success == false) {
                swal({
                    title: "Error!",
                    text: "Error sending!",
                    type: "error",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Okay"
                });
            }

            else {
                swal({
                    title: "Done!",
                    text: response.detail,
                    type: "success",
                    confirmButtonColor: "#9c27b0",
                    confirmButtonText: "Okay"
                });
                $("#modalBacteriaTaxo").modal('hide');
                $("#reasonsBacteriaTaxo").modal('hide');
                notificationList();
            }
        });
    }
}

function selectBacteria() {
    $.get('/notificationSelectBacteria', (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }
        let data = response.data;
        console.log(data);
        let html = "<option value=''>...</option>";
        data.forEach((element, index) => {
            html += "<option value=" + element.bacteriumID + ">" + element.bacteriumScientificName + "</option>";
        });
        $('#toSelectBacteria1').html(html);
        $('#toSelectBacteria2').html(html);
    });
}

let viewDiseaseID = 0;
function viewDisease(id) {
    viewDiseaseID = id;
    let url = "/notificationViewDisease/" + viewDiseaseID;

    $.get(url, (response) => {
        if (response.success == false) {
            $.notify("Error getting data form the server!");
            return;
        }

        let data = response.data;
        $('select[name=selectBacteria1').val(data.bacteriumID);
        $('input[name=modalName').val(data.diseaseName);
        $('textarea[name=modalDesc]').val(data.diseaseDesc);

        $("#modalSymptoms").html("");

        data.symptoms.forEach((element, index) => {
            addFieldEdit(element);
        });

        let html;
        $('#modalDisease').html(html);
        sympCount = data.symptoms.length;
    });
}

function approvedDisease(eAdd) {
    eAdd.preventDefault();

    let formData = $('#modalDiseaseForm').serializeArray();
    let _data = {
        symptoms: [],
    };
    let error = 0;
    formData.forEach((element, index) => {
        console.log(element.name + ":" + element.value);
        if (element.value == "") {
            error++;
            return;
        }
        if (element.name.search("modalSymp") == -1) {
            _data[element.name] = element.value;
        } else {
            _data.symptoms.push(element.value);
        }
    });
    if (error == 0) {
        _data.symptoms = _data.symptoms.join(":");
        swal({
            title: 'Approved Disease',
            text: "Are you sure?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes'
        }).then(function (ok) {
            if (ok) {
                $.ajax({
                    url: "/notificationApprovedDisease/" + viewDiseaseID,
                    type: "POST",
                    data: _data,
                    success: function (res) {
                        if (res.success) {
                            swal({
                                title: "Done!",
                                text: res.detail,
                                type: "success",
                                confirmButtonColor: "#9c27b0",
                                confirmButtonText: "Okay"
                            });
                            $('#modalDisease').modal("hide");
                            notificationList();
                        } else {
                            $.notify("Failed: " + res.detail, { type: "danger" });
                        }
                    },
                    error: function (xhr) {
                        $.notify("Failed: " + xhr.status + " " + xhr.statusText, { type: "danger" });
                    }
                });
            }
        });
    } else {
        $.notify("All field must be filled.", { type: "warning" });
    }
}

function rejectDisease() {
    if (isClicked != 0) {
        return;
    }
    isClicked++;
    swal({
        title: 'Reject Disease',
        text: "Are you sure?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes'
    }).then((isConfirmed) => {
        if (isConfirmed) {
            $("#reasonsDisease").modal('show');
            sendReasonDisease();
        }
        else {
            $("#modalDisease").modal('hide');
        }
    })
}

function sendReasonDisease() {
    let url = "/rejectDisease/" + viewDiseaseID;
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};

    console.log(url);
    let data = $("#reasonsDiseaseForm").serializeArray();
    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        if (element.value == "") {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[0-9*#\/]/g) != null) {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            dataInsert[element.name] = element.value;
        }

    });

    if (errCount > 0) {
        $.notify("Provide Reasons of Rejecting!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        $.post(url, dataInsert, function (response) {
            if (response.success == false) {
                swal({
                    title: "Error!",
                    text: "Error sending!",
                    type: "error",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Okay"
                });
            }

            else {
                swal({
                    title: "Done!",
                    text: response.detail,
                    type: "success",
                    confirmButtonColor: "#9c27b0",
                    confirmButtonText: "Okay"
                });
                $("#modalDisease").modal('hide');
                $("#reasonsDisease").modal('hide');
                notificationList();
            }
        });
    }
}

let viewToxinID = 0;
function viewToxin(id) {
    viewToxinID = id;
    let url = '/notificationViewToxin/' + viewToxinID;
    console.log(url);
    $.get(url, (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }
        console.log(response.data)
        $('select[name=selectBToxin]').val(response.data.bacteriumID);
        $('input[name=toxin]').val(response.data.name);
        $('textarea[name=sctructureFeature]').val(response.data.feature);
        $('textarea[name=functionn]').val(response.data.functionn);
    });
}

function approvedToxin(eAdd) {
    eAdd.preventDefault();
    if (isClicked != 0) {
        return;
    }
    isClicked++;

    let url = "/approvedToxin/" + viewToxinID;
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};
    console.log(url);

    let data = $("#modalToxinForm").serializeArray();

    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        if (element.value == "") {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[*#\/]/g) != null) {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            dataInsert[element.name] = element.value;
        }

    });

    if (errCount > 0) {
        $.notify("All fields must be filled!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        isClicked = 0;
        swal({
            title: 'Approved Toxin',
            text: "Are you sure?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes'
        }).then((isConfirmed) => {
            if (isConfirmed) {
                $.post(url, dataInsert, function (response) {
                    if (response.success == false) {
                        swal({
                            title: "Error!",
                            text: "Data Already Exists!",
                            type: "error",
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Okay"
                        });
                    }

                    else {
                        swal({
                            title: "Done!",
                            text: response.detail,
                            type: "success",
                            confirmButtonColor: "#9c27b0",
                            confirmButtonText: "Okay"
                        });
                        $("#modalToxins").modal('hide');
                        notificationList();
                    }
                });
            }
        })
    }

}

function rejectToxin() {
    if (isClicked != 0) {
        return;
    }
    isClicked++;
    swal({
        title: 'Reject Bacteria Taxon',
        text: "Are you sure?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes'
    }).then((isConfirmed) => {
        if (isConfirmed) {
            $("#reasonsToxin").modal('show');
            sendReasonToxin();
        }
        else {
            $("#modalToxins").modal('hide');
        }
    })
}

function sendReasonToxin() {

    let url = "/rejectToxin/" + viewToxinID;
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};

    console.log(url);
    let data = $("#reasonsToxinForm").serializeArray();
    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        if (element.value == "") {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[0-9*#\/]/g) != null) {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            dataInsert[element.name] = element.value;
        }

    });

    if (errCount > 0) {
        $.notify("Provide Reasons of Rejecting!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        $.post(url, dataInsert, function (response) {
            if (response.success == false) {
                swal({
                    title: "Error!",
                    text: "Error sending!",
                    type: "error",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Okay"
                });
            }

            else {
                swal({
                    title: "Done!",
                    text: response.detail,
                    type: "success",
                    confirmButtonColor: "#9c27b0",
                    confirmButtonText: "Okay"
                });
                $("#modalToxins").modal('hide');
                $("#reasonsToxin").modal('hide');
                notificationList();
            }
        });
    }
}

function selectDisease() {
    $.get('/notificationSelectDisease', (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }
        let data = response.data;
        console.log(data);
        let html = "<option value=''>...</option>";
        data.forEach((element, index) => {
            html += "<option value=" + element.diseaseID + ">" + element.diseaseName + "</option>";
        });
        $('#toSelectDisease').html(html);
    });
}

let viewPreventionID = 0;
function viewPrevention(id) {
    viewPreventionID = id;
    let url = "/notificationViewPrevention/" + viewPreventionID;
    console.log(url);

    $.get(url, (response) => {
        if (response.success == false) {
            $.notify("Error getting data form the server!");
            return;
        }

        let data = response.data;
        $('select[name=selectDisease]').val(data.diseaseID);

        $("#modalPreventionDisplay").html("");

        data.preventions.forEach((element, index) => {
            addFieldEdit2(element);
        });

        let html;
        $('#modalPreventions').html(html);
        preventionCount = data.preventions.length;
    });
}

function approvedPrevention(eAdd) {
    eAdd.preventDefault();

    let formData = $('#modalPreventionForm').serializeArray();
    let _data = {
        preventions: [],
    };
    let error = 0;
    formData.forEach((element, index) => {
        console.log(element.name + ":" + element.value);
        if (element.value == "") {
            error++;
            return;
        }
        if (element.name.search("modalPrev") == -1) {
            _data[element.name] = element.value;
        } else {
            _data.preventions.push(element.value);
        }
    });
    if (error == 0) {
        _data.preventions = _data.preventions.join(":");
        swal({
            title: 'Approved Preventions',
            text: "Are you sure?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes'
        }).then(function (ok) {
            if (ok) {
                $.ajax({
                    url: "/notificationApprovedPrevention/" + viewPreventionID,
                    type: "POST",
                    data: _data,
                    success: function (res) {
                        if (res.success) {
                            swal({
                                title: "Done!",
                                text: res.detail,
                                type: "success",
                                confirmButtonColor: "#9c27b0",
                                confirmButtonText: "Okay"
                            });
                            $('#modalPreventions').modal("hide");
                            notificationList();
                        } else {
                            $.notify("Failed: " + res.detail, { type: "danger" });
                        }
                    },
                    error: function (xhr) {
                        $.notify("Failed: " + xhr.status + " " + xhr.statusText, { type: "danger" });
                    }
                });
            }
        });
    } else {
        $.notify("All field must be filled.", { type: "warning" });
    }
}

function rejectPrevention() {
    if (isClicked != 0) {
        return;
    }
    isClicked++;
    swal({
        title: 'Reject Prevention',
        text: "Are you sure?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes'
    }).then((isConfirmed) => {
        if (isConfirmed) {
            $("#reasonsPrevention").modal('show');
            sendReasonPrevention();
        }
        else {
            $("#modalPreventions").modal('hide');
        }
    })
}

function sendReasonPrevention() {
    let url = "/rejectPrevention/" + viewPreventionID;
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};

    console.log(url);
    let data = $("#reasonsPreventionForm").serializeArray();
    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        if (element.value == "") {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[0-9*#\/]/g) != null) {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            dataInsert[element.name] = element.value;
        }

    });

    if (errCount > 0) {
        $.notify("Provide Reasons of Rejecting!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        $.post(url, dataInsert, function (response) {
            if (response.success == false) {
                swal({
                    title: "Error!",
                    text: "Error sending!",
                    type: "error",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Okay"
                });
            }

            else {
                swal({
                    title: "Done!",
                    text: response.detail,
                    type: "success",
                    confirmButtonColor: "#9c27b0",
                    confirmButtonText: "Okay"
                });
                $("#modalPreventions").modal('hide');
                $("#reasonsPrevention").modal('hide');
                notificationList();
            }
        });
    }
}

let viewAnimalID = 0;
function viewAnimal(id) {
    viewAnimalID = id;
    let url = "/notificationViewAnimal/" + viewAnimalID;

    $.get(url, (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the Server!", { type: "danger" });
            return;
        }

        $('.animalEditPic').attr('src', response.data.image.replace('public', 'assets'))
        $("input[name=modalCommonName]").val(response.data.animalName);
        $("input[name=modalScientificName]").val(response.data.animalScientificName);
        $("input[name=modalBodySite]").val(response.data.bodySite);

        $('.toClassify').on('click', () => {
            console.log('asd')
            $("input[name=modalPhylum2]").val(response.data.phylum);
            $("input[name=modalClass2]").val(response.data.classs);
            $("input[name=modalOrder2]").val(response.data.order);
            $("input[name=modalFamily2]").val(response.data.family);
            $("input[name=modalGenus2]").val(response.data.genus);
            $("input[name=modalSpecies2]").val(response.data.species);

            $('.toApprove').show();
            $('.toReject').show();
            $('.toClassify').hide();
        });
    });
}

function approvedAnimal(eAdd) {
    eAdd.preventDefault();
    let dataInsert = new FormData($("#modalAnimalForm")[0]);
    let data = $("#modalAnimalForm").serializeArray();
    let errCount = 0;
    let invCount = 0;

    data.forEach((element, index) => {

        if (element.value == "") {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[0-9*#\/]/g) != null) {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            //dataInsert.append(element.name,element.value);
        }

    });

    if (errCount > 0) {
        $.notify("Fields must be filled out!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        swal({
            title: "Warning!",
            text: "Are you sure?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
        }).then(function (isConfirmed) {
            if (isConfirmed) {
            }
            $.ajax({
                type: "POST",
                url: "/approvedAnimal/" + viewAnimalID,
                data: dataInsert,
                processData: false,
                contentType: false,
                success: function (response) {
                    isClicked = 0;
                    if (response.success == false) {
                        isClicked = 0;
    
                        if (response.error == 1) {
                            $.notify(response.detail, { type: "danger" });
                        }
    
                        else if (response.error == 2) {
                            $.notify(response.detail, { type: 'danger' });
                        }
    
                        else if (response.error == 3) {
                            $.notify(response.detail, { type: "danger" });
                        }
    
                        else {
                            $.notify(response.detail, { type: "danger" });
                        }
    
                    }
                    else {
    
                        swal({
                            title: "Success",
                            text: response.detail,
                            type: "success",
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Okay",
                        });
                        $("#modalAnimal").modal("hide");
                        notificationList();
                    }
                }
            });
        });
    }
}

function rejectAnimal() {
console.log("SAMA");
    if (isClicked != 0) {
        return;
    }
    isClicked++;
    swal({
        title: 'Reject Animal',
        text: "Are you sure?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes'
    }).then((isConfirmed) => {
        if (isConfirmed) {
            $("#reasonsAnimal").modal('show');
            sendReasonAnimal();
        }
        else {
            $("#modalAnimal").modal('hide');
        }
    })

}

function sendReasonAnimal() {
    let url = "/rejectAnimal/" + viewAnimalID;
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};

    console.log(url);
    let data = $("#reasonsAForm").serializeArray();
    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        if (element.value == "") {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[0-9*#\/]/g) != null) {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            dataInsert[element.name] = element.value;
        }

    });

    if (errCount > 0) {
        $.notify("Provide Reasons of Rejecting!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        $.post(url, dataInsert, function (response) {
            if (response.success == false) {
                swal({
                    title: "Error!",
                    text: "Error sending!",
                    type: "error",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Okay"
                });
            }

            else {
                swal({
                    title: "Done!",
                    text: response.detail,
                    type: "success",
                    confirmButtonColor: "#9c27b0",
                    confirmButtonText: "Okay"
                });
                $("#modalAnimal").modal('hide');
                $("#reasonsAnimal").modal('hide');
                notificationList();
            }
        });
    }
}
let viewBacteriaID = 0;
function viewBacteria(id) {
    viewBacteriaID = id;
    let url = "/notificationViewBacteria/" + viewBacteriaID;

    $.get(url, (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }

        console.log(response.data);
        console.log("Andito namana ko eh");
        $("select[name=toSelect]").val(response.data.animalID);
        $("input[name=speciesName]").val(response.data.speciesName);
        $("input[name=genusName]").val(response.data.genusName);
        $("input[name=tissueSpecifity]").val(response.data.tissueSpecifity);
        $("input[name=sampleType]").val(response.data.sampleType);
        $("input[name=isolation]").val(response.data.isolation);
        $("input[name=identification]").val(response.data.identification);

        $('.toClassify1').on('click', () => {

            $("input[name=bPhylum]").val(response.data.phylum);
            $("input[name=bClass]").val(response.data.class);
            $("input[name=bOrder]").val(response.data.order);
            $("input[name=bFamily]").val(response.data.family);
            $("input[name=bGenus]").val(response.data.genus);
            $("input[name=bSpecies]").val(response.data.species);
            $("input[name=scientificName]").val(response.data.scientificName);

            $('.toApprove1').show();
            $('.toReject1').show();
            $('.toClassify1').hide();
        });
    });
}

function selectAnimal() {
    $.get("/notificationSelectAnimal", (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }
        let data = response.data;
        console.log(data);
        let html = "<option value=''>...</option>";
        data.forEach((element, index) => {
            html += "<option value=" + element.animalID + ">" + element.animalScientificName + "</option>";
        });
        $('#toSelectAnimal').html(html);
    });
}

function approvedBacteria(eAdd) {
    eAdd.preventDefault();

    let url = "/approvedBacteria/" + viewBacteriaID;

    let data = $("#modalBacteriaForm").serializeArray();
    let errCount = 0;
    let numCount = 0;
    let strCount = 0;
    let dataInsert = {};

    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        isClick = 0;
        if (element.value == "") {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            $('select[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
        }

        else if ($('select[name=toSelect]').val().match(/[a-zA-Z*#\/]/g) != null && $('input[type=number]').val().match(/[a-zA-Z*#\/]/g) != null) {
            $('select[name=toSelect]').css("background", "#feebeb");
            $('input[type=number]').css("background", "#feebeb");
            numCount++;
        }

        else if ($('input[type=text]').val().match(/[0-9*#\/]/g) != null) {
            $('input[type=text]').css("background", "#feebeb");
            strCount++;
        }

        else {
            dataInsert[element.name] = element.value;
        }
    });

    if (errCount > 0) {
        $.notify("All fields must be filled!", { type: "danger" });
    }

    else if (numCount > 0) {
        $.notify("Invalid input!", { type: "danger" });
    }

    else if (strCount > 0) {
        $.notify("Invalid Characters!", { type: "danger" });
    }

    else {
        swal({
            title: 'Approved Bacteria',
            text: "Are you sure?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes'
        }).then((isConfirmed) => {
            if (isConfirmed) {
                $.post(url, dataInsert, function (response) {
                    isClick = 0;
                    if (response.success == false) {
                        isClick = 0;
                        if (response.error == 1) {
                            $.notify(response.detail, { type: "danger" });
                        }

                        else if (response.error == 2) {
                            $.notify(response.detail, { type: "danger" });
                        }

                        else if (response.error == 3) {
                            $.notify(response.detail, { type: "danger" });
                        }

                        else {
                            swal({
                                title: "Error!",
                                text: response.detail,
                                type: "error",
                                confirmButtonColor: "#DD6B55",
                                confirmButtonText: "Okay"
                            });
                        }
                    }

                    else {
                        swal({
                            title: "Done!",
                            text: response.detail,
                            type: "success",
                            confirmButtonColor: "#9c27b0",
                            confirmButtonText: "Okay"
                        });

                        $("#modalBacteria").modal("hide");
                        notificationList();
                    }
                });
            }
        });
    }

}

function rejectBacteria() {

    if (isClicked != 0) {
        return;
    }
    isClicked++;
    swal({
        title: 'Reject Bacteria',
        text: "Are you sure?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes'
    }).then((isConfirmed) => {
        if (isConfirmed) {
            $("#reasonsBacteria").modal('show');
            sendReasonBacteria();
        }
        else {
            $("#modalBacteria").modal('hide');
        }
    })

}

function sendReasonBacteria() {
    let url = "/rejectBacteria/" + viewBacteriaID;
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};

    console.log(url);
    let data = $("#reasonsBForm").serializeArray();
    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        if (element.value == "") {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
            isClicked = 0;
        }

        else if (element.value.match(/[0-9*#\/]/g) != null) {
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
            isClicked = 0;
        }

        else {
            dataInsert[element.name] = element.value;
        }

    });

    if (errCount > 0) {
        $.notify("Provide Reasons of Rejecting!", { type: "danger" });
    }

    else if (invCount > 0) {
        $.notify("Invalid Character!", { type: "danger" });
    }

    else {
        $.post(url, dataInsert, function (response) {
            if (response.success == false) {
                swal({
                    title: "Error!",
                    text: "Error sending!",
                    type: "error",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Okay"
                });
            }

            else {
                swal({
                    title: "Done!",
                    text: response.detail,
                    type: "success",
                    confirmButtonColor: "#9c27b0",
                    confirmButtonText: "Okay"
                });
                $("#modalBacteria").modal('hide');
                $("#reasonsBacteria").modal('hide');
                notificationList();
            }
        });
    }
}

let count = 0;
let sympCount = 0;
let target = $(".symptomsTxt");
let targetBtn = $("#responseButton");

function addField() {
    if (count >= 9) {
        $.notify("You reached the maximum numbers of field!", { type: "danger" });
        return;
    }

    let boxName = "symptoms" + count;
    let buttonName = "button" + count;
    let html = '<input type="text" class="form-control" name="' + boxName + '""/>';
    let button = '<button name="' + buttonName + '"type="button" onclick ="deleteField(' + count + ')" rel="tooltip" title="" class="btn btn-danger btn-round btn-icon btn-icon-mini btn-neutral" data-original-title="Remove"><i class="now-ui-icons ui-1_simple-remove"></i></button>';

    let newDiv = "<div class='sympDiv" + count + " row'>" + "<div class='col-md-10'>" + html + "</div><div class='col-sm-2'>" + button + "</div>";

    target.append(newDiv);
    count++;
    console.log(count);
    console.log(boxName);
}

function deleteField(count) {
    $('input[name=symptoms' + count + ']').remove();
    $('button[name=button' + count + ']').remove();
    $('.sympDiv' + count).remove();
    count--;
    console.log(count + "lol");
}

let count1 = 0;
let preventionCount = 0;
let target1 = $(".preventionTxt");
let targetBtn1 = $("#responseButton");

function addFieldPrevention() {
    if (count1 >= 9) {
        $.notify("You reached the maximum numbers of field!", { type: "danger" });
        return;
    }

    let boxName = "prevention" + count1;
    let buttonName = "button" + count1;
    let html = '<input type="text" class="form-control" name="' + boxName + '""/>';
    let button = '<button name="' + buttonName + '"type="button" onclick ="deleteField(' + count1 + ')" rel="tooltip" title="" class="btn btn-danger btn-round btn-icon btn-icon-mini btn-neutral" data-original-title="Remove"><i class="now-ui-icons ui-1_simple-remove"></i></button>';
    let newDiv = "<div class='preventionDiv" + count1 + " row'>" + "<div class='col-md-10'>" + html + "</div><div class='col-sm-2'>" + button + "</div>";

    target1.append(newDiv);

    console.log(count1);
    console.log(boxName);
    count1++;
}

function deleteField(count1) {
    $('input[name=prevention' + count1 + ']').remove();
    $('button[name=button' + count1 + ']').remove();
    $('.preventionDiv' + count1).remove();
    count1--;
    console.log(count1 + "lol");
}

let addFieldEdit = function (value) {
    if ($('.symptomsEditDiv').length >= 10) {
        $.notify("You reached the maximum numbers of field!", { type: "danger" });
        return;
    }

    value = value == undefined ? "" : value;

    let html = "<input class='form-control' name='modalSymp" + sympCount + "' value='" + value + "' type = 'text'/><br>";
    let buttonName = "buttonEdit" + sympCount;
    let button = '<button name="' + buttonName + '"type="button" onclick ="deleteFieldEdit(' + sympCount + ')" rel="tooltip" title="" class="btn btn-danger btn-round btn-icon btn-icon-mini btn-neutral" data-original-title="Remove"><i class="now-ui-icons ui-1_simple-remove"></i></button>';

    let newDiv = "<div class='symptomsEditDiv sympEditDiv" + sympCount + " row'>" + "<div class='col-sm-10'>" + html + "</div><div class='col-sm-2'>" + button + "</div>";

    $("#modalSymptoms").append(newDiv);
    sympCount++;
}

let deleteFieldEdit = function (selected) {
    $('.sympEditDiv' + selected).remove();
}

let addFieldEdit2 = function (value) {
    if ($('.preventionEditDiv').length >= 10) {
        $.notify("You reached the maximum numbers of field!", { type: "danger" });
        return;
    }

    value = value == undefined ? "" : value;

    let html = "<input class='form-control' name='modalPrev" + preventionCount + "' value='" + value + "' type = 'text'/><br>";
    let buttonName = "buttonEdit" + preventionCount;
    let button = '<button name="' + buttonName + '"type="button" onclick ="deleteFieldEdit2(' + preventionCount + ')" rel="tooltip" title="" class="btn btn-danger btn-round btn-icon btn-icon-mini btn-neutral" data-original-title="Remove"><i class="now-ui-icons ui-1_simple-remove"></i></button>';

    let newDiv = "<div class='preventionEditDiv prevEditDiv" + preventionCount + " row'>" + "<div class='col-sm-10'>" + html + "</div><div class='col-sm-2'>" + button + "</div>";

    $("#modalPreventionDisplay").append(newDiv);
    preventionCount++;
}

let deleteFieldEdit2 = function (selected) {
    $('.prevEditDiv' + selected).remove();
}
