$(function(){
    diseaseModules();
    $("input[name=diseaseName]").autocomplete({
        source: (req,res) => {
            $.ajax({
                type: "GET",
                url: "/search/diseaseName/?data=" + req.term,
                success: function (response) {
                    res($.map(response.data, function (value, key) {
                        return {
                            label: value.name,
                            value: value.tb_name + '-' + value.name
                        }
                    }));
                }
            ,
                error: function (response) {
                    console.log(response.detail);
                },
            });
        }
    });
    console.log("WHE");
});

let diseaseIsClick = 0;

function searchDisease(e) {
    e.preventDefault();

    if (diseaseIsClick !=0) {
        return;
    }
    diseaseIsClick++;

    let data = $("#searchDisease").serializeArray();
    let dataInsert = {};
    console.log('data', data);
    diseaseIsClick = 0;

    var variables = data[0].value.split('-')

    if (data[0].value == ""){
        $("input[name=diseaseName").css("background", "#feebeb");

        let html = "<label class='pull-right'><font color='red'>Filled up the field!</font></label>";
        $(".diseaseNotif").html(html);
    }

    else if (data[0].value.match(/[*#\/]/g) != null){
        $("input[name=diseaseName").css("background", "#feebeb");

        let html = "<label class='pull-right'><font color='red'>Invalid Character!</font></label>";
        $(".diseaseNotif").html(html);
    }

    else {
        dataInsert[variables[0] + 'Name'] = variables[1];
    }

    

    console.log('dataInsert', dataInsert);


    $.post('/researcher_' + variables[0],dataInsert,(response)=>{
       
        if(response.success == false) {
            return;
        }

        $("body").replaceWith(response);
    });
}

function diseaseModules() {
    console.log("LEKAY");

    $.get("/diseaseModules",(response)=>{

        if(response.success==false){
            $.notify("Error getting Data from the Server!",{type:"danger"});
            return;
        }

        let data = response.data;
        let html = "";
        data.forEach((element, index) => {
            let row = "<tr>";
            row += "<td style='cursor: pointer; ' onclick ='viewDisease("+element.diseaseID+")'>" + element.diseaseName + "</td>";
            row += "<td>" + element.diseaseDesc.substring(0,200)+"..." + "</td>";
            row += "<td class='text-center'>" + element.doi + "</td>";
            row += "</tr>";
            html += row;
        });
        $('#disModuleList').html(html);
        $('#disModuleTable').dataTable();
    });
}

function viewDisease(id) {
    window.location="view_disease?diseaseID="+id;
}