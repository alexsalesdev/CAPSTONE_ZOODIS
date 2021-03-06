$(function () { //onload
    diseaseList();
    toSelectJournalDisease2();
});
//Start: Adding field

let isClicked = 0;
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
    let html = '<input type="text" autocomplete="off" class="form-control" name="' + boxName + '""/>';
    let button = '<button name="' + buttonName + '"type="button" onclick ="deleteField(' + count + ')" rel="tooltip" title="" class="btn btn-danger btn-round btn-icon btn-icon-mini btn-neutral" data-original-title="Remove"><i class="now-ui-icons ui-1_simple-remove"></i></button>';

    let newDiv = "<div class='sympDiv" + count + " row'>" + "<div class='col-md-9'>" + html + "</div><div class='col-sm-2'>" + button + "</div>";

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

function addDisease(eAdd) {
    eAdd.preventDefault();

    if (isClicked != 0) {
        return;
    }
    isClicked++;

    let data = $("#diseaseForm").serializeArray();
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};

    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        isClicked = 0;
        if (element.value === "") {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            $('select[name='+element.name+']').css("background", "#feebeb");
            errCount++;
        }
        else if (element.value.match(/[*#\/]/g) !== null) {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            $('textarea[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
        }
        else {
            dataInsert[element.name] = element.value;
        }
    });

    isClicked = 0;

    if (errCount > 0) {
        $.notify("All fields must be filled!", { type: "danger" });
        return;
    }

    else if (invCount > 0) {
        $.notify("Invalid Characters!", { type: "danger" });
        return;
    }

    swal({
        title: 'Are you sure?',
        text: "Add Disease",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#9c27b0',
        confirmButtonText: 'Yes',
        allowOutsideClick: false
    }).then((isConfirmed) => {
        if (!isConfirmed) {
            return;
        }

        $.post("/disease", dataInsert, (response) => {
            if (!response.success) {
                swal({
                    title: "Error!",
                    text: "Data Already Exists!",
                    type: "error",
                    confirmButtonColor: "#9c27b0",
                    confirmButtonText: "Okay",
                    allowOutsideClick: false
                });
                return;
            }

            swal({
                title: "Done!",
                text: "Successfully Added!",
                type: "success",
                confirmButtonColor: "#9c27b0",
                confirmButtonText: "Okay",
                allowOutsideClick: false
            });
            diseaseList();
            clearDisease();
        });

    })
}

function clearDisease() {
    
    $('select[name=selectJournal]').val("");
    $('select[name=selectJournal]').val('').trigger('chosen:updated');
    $('input[name=bodySite]').val("");
    $('input[name=strDiseaseName]').val("");
    $('textarea[name=strDiseaseDesc]').val("");
    $('input[name=strSymptoms]').val("");
    $('input[name=symptoms0').val("");
    $('input[name=symptoms1').val("");
    $('input[name=symptoms2').val("");
    $('input[name=symptoms3').val("");
    $('input[name=symptoms4').val("");
    $('input[name=symptoms5').val("");
    $('input[name=symptoms6').val("");
    $('input[name=symptoms7').val("");
    $('input[name=symptoms8').val("");
    isClick =0;
}

function diseaseList() {
    $.get("/diseaseList", (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }

        let data = response.data;
        let html = "";
        data.forEach((element, index) => {
            let row = "<tr>";
            row += "<td>" + element.diseaseName + "</td>";
            row += "<td>" + element.diseaseDesc + "</td>";
            row += "<td><a data-toggle='modal' href='#exampleModalCenter'><button onclick = editDisease(" + element.diseaseID + ") type='button' rel='tooltip' title='Edit' class='btn btn-round btn-info btn-icon btn-sm'><i class='now-ui-icons ui-2_settings-90'></i></button></a>&nbsp;<a data-toggle='modal' href='#viewModal'><button onclick = 'viewDisease(" + element.diseaseID + ")' type='button' rel='tooltip' title='View Details' class='btn btn-round btn-success btn-icon btn-sm'><i class='now-ui-icons travel_info'></i></button></a></td>";
            row += "</tr>";
            html += row;
        });
        $('#diseaseTableList').html(html);
        $('#diseaseTable').dataTable();

    });
}

let viewDiseaseID = 0;
function viewDisease(vDiseaseID) {

    viewDiseaseID = vDiseaseID;
    let url = "/viewDisease/" + viewDiseaseID;
    console.log(url);

    $.get(url, (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }

        console.log("here");
        let data = response.data;
        let html = "";
        let bodySite = "<p>"+data.bodySite+"</p>";
        let diseaseName = "<h5><font color='#9c27b0'><b>" + data.diseaseName + "</b></font></h5>";
        let diseaseDesc = "<p>" + data.diseaseDesc + "</p>";

        data.symptoms.forEach((element, index) => {
            let list = "<ul>";
            list += "<li>" + element + "</li>";
            list += "</ul>";
            html += list;

        });

        $("#viewSite").html(bodySite);
        $("#viewDiseaseName").html(diseaseName);
        $("#viewDiseaseDesc").html(diseaseDesc);
        $("#viewSymptoms").html(html);
    });
};

let editDiseaseID = -1;
function editDisease(id) {
    editDiseaseID = id;
    let url = "/viewDisease/" + editDiseaseID;

    $.get(url,(response) =>{
        if(response.success == false) {
            $.notify("Error getting data form the server!");
            return;
        }

        let data = response.data;
        $('input[name=modalSite').val(data.bodySite);
        $('input[name=modalName').val(data.diseaseName);
        $('textarea[name=modalDesc]').val(data.diseaseDesc);
        
        $("#modalSymptoms").html("");

        data.symptoms.forEach((element,index) => {
            addFieldEdit(element);
        });

        let html;
        $('#exampleModalCenter').html(html);
        sympCount = data.symptoms.length;
    });

};

let updateDisease = function(){
    let formData = $('#editDiseaseForm').serializeArray();
    let _data = {
        symptoms: [],
    };
    let error = 0;
    formData.forEach((element,index)=>{
        console.log(element.name+":"+element.value);
        if(element.value == ""){
            error++;
            return;
        }
        if(element.name.search("modalSymp") == -1){
            _data[element.name] = element.value;
        }else{
            _data.symptoms.push(element.value);
        }
    });
    if(error == 0){
        _data.symptoms = _data.symptoms.join(":");
        swal({
            title: 'Are you sure?',
            text: "Update Disease",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9c27b0',
            confirmButtonText: 'Yes',
            allowOutsideClick: false
        }).then(function(ok){
            if(ok){
                $.ajax({
                    url: "/editDisease/" + editDiseaseID,
                    type: "POST",
                    data: _data,
                    success: function(res){
                        if(res.success){
                            swal("Done", res.detail, "success");
                            $('#exampleModalCenter').modal("hide");
                            diseaseList();
                        }else{
                            $.notify("Failed: " + res.detail,{type:"danger"});
                        }
                    },
                    error: function(xhr){
                        $.notify("Failed: " + xhr.status + " " + xhr.statusText,{type:"danger"});
                        //swal("Failed", xhr.statusText, "error");
                    }
                });
            }
        });
    }else{
        $.notify("All field must be filled.",{type:"warning"}); //change this leki
    }
}

let addFieldEdit = function(value){
    if($('.symptomsEditDiv').length >= 10){
        $.notify("You reached the maximum numbers of field!", { type: "danger" });
        return;
    }

    value = value == undefined ? "" : value;

    let html ="<input class='form-control' name='modalSymp"+sympCount+"' value='"+ value +"' type = 'text'/><br>";
    let buttonName = "buttonEdit" + sympCount;
    let button = '<button name="' + buttonName + '"type="button" onclick ="deleteFieldEdit(' + sympCount + ')" rel="tooltip" title="" class="btn btn-danger btn-round btn-icon btn-icon-mini btn-neutral" data-original-title="Remove"><i class="now-ui-icons ui-1_simple-remove"></i></button>';

    let newDiv = "<div class='symptomsEditDiv sympEditDiv" + sympCount + " row'>" + "<div class='col-sm-10'>" + html + "</div><div class='col-sm-2'>" + button + "</div>";

    $("#modalSymptoms").append(newDiv);
    sympCount++;
}

let deleteFieldEdit = function(selected) {
    $('.sympEditDiv' + selected).remove();
}

function toSelectJournalDisease2() {
    $.get("/toSelectJournalDisease2", (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }
        console.log("DITO NA");
        let data = response.data;
        let html = "<option value=''>...</option>";
        data.forEach((element, index) => {
            html += "<option value=" + element.journalID + ">" + element.code + " - " + element.name + "</option>";
        });
        $('#toSelectJournal').html(html);
    });

}