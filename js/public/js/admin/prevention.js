
$(function () {
    toSelectDisease();
    preventionList();
});

let isClick = 0;
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
    let html = '<input type="text" autocomplete="off" class="form-control" name="' + boxName + '""/>';
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


function toSelectDisease() {
    $.get("/toSelectDisease",(response)=>{
        if(response.success == false) {
            $.notify("Error getting data from the Server!",{type:"danger"});
            return;
        }

        let data = response.data;
        let html ="<option value = ''>...</option>";
        data.forEach((element, index) => {
            html += "<option value=" + element.diseaseID + ">" + element.diseaseName + "</option>";
        });
        $('#toSelectDisease').html(html);
    });
}

function addPrevention(eAdd) {
    eAdd.preventDefault();

    if(isClick !=0){
        return;
    }
    isClick++

    let data = $("#preventionForm").serializeArray();
    let errCount = 0;
    let invCount = 0;
    let dataInsert = {};


    data.forEach((element, index) => {
        console.log(element.name + ":" + element.value);

        isClick = 0;
        if (element.value == "") {
            $('select[name'+element.name+']').css("background", "#feebeb"); //no functioning!
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            errCount++;
        }

        else if (element.value.match(/[*#\/]/g) != null) {
            $('input[name=' + element.name + ']').css("background", "#feebeb");
            invCount++;
        }

        else {
            dataInsert[element.name] = element.value;
        }
    });

    if(errCount>0) {
        $.notify("All fields must be filled!",{type: "danger"});
        return;
    }

    else if(invCount>0){
        $.notify("Invalid Character!",{type:"danger"});
        return;
    }

    swal({
        title: 'Are you sure?',
        text: "Add Prevention",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#9c27b0',
        confirmButtonText: 'Yes',
        allowOutsideClick: false
    }).then((isConfirmed) => {
        if (!isConfirmed) {
            return;
        }

        $.post("/addPrevention", dataInsert, (response) => {
            if (!response.success) {
                swal({
                    title: "Error!",
                    text: response.detail,
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
            clearPrevention();
            preventionList();
        });
    });
}

function clearPrevention() {

    $('select[name=selectDisease]').val("");
    $('select[name=selectDisease]').val('').trigger('chosen:updated');
    $('input[name=strPrevention]').val("");
    $('input[name=prevention0]').val("");
    $('input[name=prevention1]').val("");
    $('input[name=prevention2]').val("");
    $('input[name=prevention3]').val("");
    $('input[name=prevention4]').val("");
    $('input[name=prevention5]').val("");
    $('input[name=prevention6]').val("");
    $('input[name=prevention7]').val("");
    $('input[name=prevention8]').val("");

}

function preventionList() {
    $.get("/preventionList",(response) =>{
        if(response.success == false) {
            $.notify("Error getting data from the server!",{type: "danger"});
            return;
        }

        let data = response.data;
        let html = "";
        data.forEach((element,index) => {
            let row = "<tr>";
            row += "<td>" +element.diseaseName+"</td>";
            row += "<td><a data-toggle='modal' href='#exampleModalCenter2'><button onclick = editPrevention(" + element.preventionID + ") type='button' rel='tooltip' title='Edit' class='btn btn-round btn-info btn-icon btn-sm'><i class='now-ui-icons ui-2_settings-90'></i></button></a>&nbsp;<a data-toggle='modal' href='#viewModal2'><button onclick = 'viewPrevention(" + element.preventionID + ")' type='button' rel='tooltip' title='View Details' class='btn btn-round btn-success btn-icon btn-sm'><i class='now-ui-icons travel_info'></i></button></a></td>";
            row += "</tr>";
            html += row;
        });

        $("#preventionTableList").html(html);
        $("#preventionTable").dataTable();
    });
}

let viewPreventionID = 0;
function viewPrevention(id) {

    viewPreventionID = id;
    let url = "/viewPrevention/" + viewPreventionID;
    console.log(url);

    $.get(url, (response) => {
        if (response.success == false) {
            $.notify("Error getting data from the server!", { type: "danger" });
            return;
        }

        console.log("here");
        let data = response.data;
        let html = "";
        let diseaseName = "<h5><font color='#9c27b0'><b>" + data.diseaseName + "</b></font></h5>";

        data.preventions.forEach((element, index) => {
            let list = "<ul>";
            list += "<li>" + element + "</li>";
            list += "</ul>";
            html += list;

        });

        $("#viewPreventionName").html(diseaseName);
        $("#viewPrevention").html(html);
    });
};

let editPreventionID = -1;
function editPrevention(id) {
    editPreventionID = id;

    let url = "/editPrevention/"+editPreventionID;
    console.log(url);

    $.get(url,(response) =>{
        if(response.success == false) {
            $.notify("Error getting data form the server!");
            return;
        }

        //console.log("meron");   
        let data = response.data;
        $('select[name=selectDisease]').val(data.diseaseID);
        
        $("#modalPrevention").html("");

        data.preventions.forEach((element,index) => {
            //console.log(element,index);
            addFieldEdit2(element);
        });

        let html;
        $('#exampleModalCenter2').html(html);
        preventionCount = data.preventions.length;
    });
}

let updatePrevention = function(){
    let formData = $('#editPreventionForm').serializeArray();
    let _data = {
        preventions: [],
    };
    let error = 0;
    formData.forEach((element,index)=>{
        console.log(element.name +":"+element.value);
        if(element.value == ""){
            error++;
            return;
        }
        if(element.name.search("modalPrev") == -1){
            _data[element.name] = element.value;
        }else{
            _data.preventions.push(element.value);
        }
    });
    if(error == 0){
        _data.preventions = _data.preventions.join(":");
        swal({
            title: 'Are you sure?',
            text: "Update Prevention",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9c27b0',
            confirmButtonText: 'Yes',
            allowOutsideClick: false
        }).then(function(ok){
            if(ok){
                $.ajax({
                    url: "/updatePrevention/" + editPreventionID,
                    type: "POST",
                    data: _data,
                    success: function(res){
                        if(res.success){
                            swal("Done", res.detail, "success");
                            $('#exampleModalCenter2').modal("hide");
                            preventionList();
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
        $.notify("All field must be filled.",{type:"danger"}); //change this leki
    }
}

let addFieldEdit2 = function(value){
    if($('.preventionEditDiv').length >= 10){
        $.notify("You reached the maximum numbers of field!", { type: "danger" });
        return;
    }

    value = value == undefined ? "" : value;

    let html ="<input class='form-control' name='modalPrev"+preventionCount+"' value='"+ value +"' type = 'text'/><br>";
    let buttonName = "buttonEdit" + preventionCount;
    let button = '<button name="' + buttonName + '"type="button" onclick ="deleteFieldEdit2(' + preventionCount + ')" rel="tooltip" title="" class="btn btn-danger btn-round btn-icon btn-icon-mini btn-neutral" data-original-title="Remove"><i class="now-ui-icons ui-1_simple-remove"></i></button>';

    let newDiv = "<div class='preventionEditDiv prevEditDiv" + preventionCount + " row'>" + "<div class='col-sm-10'>" + html + "</div><div class='col-sm-2'>" + button + "</div>";

    $("#modalPrevention").append(newDiv);
    preventionCount++;
}

let deleteFieldEdit2 = function(selected) {
    $('.prevEditDiv' + selected).remove();
}