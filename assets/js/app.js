var currentTrain = {};
var trainArry = {};

function initPage() {
    // put the current time in the panel heading
    setInterval(updateClock, 1000);
    setInterval(updateTable, 1000 * 10);


    // start the timers to update the data (clock, arrival times, etc.)
    var parsed = JSON.parse(localStorage.getItem("trains")) || {};
    var keys = Object.keys(parsed);
    console.log(keys);
    console.log(parsed);
    // empty object
    if (parsed[keys[0]].name == undefined) {
        return false;
    }
    for (i = 0; i < keys.length; i++) {
        var currentTrain = new Object;
        currentTrain.name = parsed[keys[i]].name;
        currentTrain.dest = parsed[keys[i]].dest;
        currentTrain.firstTime = parsed[keys[i]].firstTime;
        currentTrain.freq = parsed[keys[i]].freq;
        addTrain();
    }
}

function updateTable() {
    var i;
    var tRow = $("tr")
    if (tRow.length == 1) { // only the header row
        return false;
    }
    for (i = 1; i < tRow.length; i++) { // starting at 1 bc of the header
        var rowID = $(tRow[i]).attr("id");
        var idLen = rowID.length;
        rowID.split("");
        var index = rowID[idLen - 1]; // grab the last char of row0
        var tdNextArvl = $("<td>");
        var tdMinAwy = $("<td>");
        timeArry = getTrainTimes(trainArry["train" + index].firstTime, trainArry["train" + index].freq);
        tdNextArvl.html(timeArry[1]);
        tdNextArvl.attr("class", "nextArvl");
        tdNextArvl.attr("id", "nextArvl" + index);
        tdMinAwy.html(timeArry[0]);
        tdMinAwy.attr("class", "minAwy");
        tdMinAwy.attr("id", "minAwy" + index);
        $("#" + rowID).find($("#nextArvl" + index)).replaceWith(tdNextArvl);
        $("#" + rowID).find($("#minAwy" + index)).replaceWith(tdMinAwy);

    }
}

function updateClock() {
    $("#currentTime").html("Current Train Schedule  <h3>" + moment().format("HH:mm:ss") + "</h3");
}

function getTrainTimes(firstTime, freq) {
    var values = [];
    var mtFirstTime = moment(firstTime, "HH:mm:ss").subtract(1, "years");
    var mtCurrentTime = moment();
    var mtDiffTime = moment().diff(moment(mtFirstTime), "minutes");
    var tRemainder = mtDiffTime % freq;
    var timeTillTrain = freq - tRemainder;
    var mtTimeTillTrain = moment(mtFirstTime).add(timeTillTrain, "minutes");
    var mtNextTrain = moment().add(timeTillTrain, "minutes");
    if (moment(timeTillTrain, "mm")._i >= 60) {
        values[0] = moment(mtTimeTillTrain, "HH:mm");
    } else {
        values[0] = moment(mtTimeTillTrain).format("mm") + " min";
    }
    values[1] = moment(mtNextTrain).format("HH:mm");
    return values;
}

function addTrain() {
    var currentTrain = new Object;
    currentTrain.name = $("#inptTrainName").val().trim();
    currentTrain.dest = $("#inptDestination").val().trim();
    currentTrain.firstTime = $("#inptFirstTime").val();
    currentTrain.freq = $("#inptFreq").val();
    if (currentTrain.name == "" || currentTrain.dest == "") {
        return false;
    }
    // returns an array with the minutes to arrival, and next arrival
    var timeArry = getTrainTimes(currentTrain.firstTime, currentTrain.freq)

    // create the table elements
    tRows = $("tr");
    tr = $("<tr>");
    tdName = $("<td>");
    tdDest = $("<td>");
    tdFreq = $("<td>");
    tdNextArvl = $("<td>");
    tdMinAwy = $("<td>");
    tdEdit = $("<td>");
    tdDel = $("<td>");

    // configure the elements
    tr.attr("id", "row" + tRows.length); // for deletions from table
    tdName.html(currentTrain.name);
    tdDest.html(currentTrain.dest);
    tdFreq.html(currentTrain.freq);
    tdNextArvl.html(timeArry[1]);
    tdNextArvl.attr("class", "nextArvl");
    tdNextArvl.attr("id", "nextArvl" + tRows.length);
    tdMinAwy.html(timeArry[0]);
    tdMinAwy.attr("class", "minAwy");
    tdMinAwy.attr("id", "minAwy" + tRows.length);
    tdEdit.html("<button id=btnEdit" + tRows.length + " class=\"btn btn-primary edit-row\">Edit</button>");
    tdDel.html("<button id=btnDel" + tRows.length + " class=\"btn btn-primary delete-row\">Remove</button>");

    // add them to the page
    $("#train-table").append(tr);
    tdName.appendTo(tr);
    tdDest.appendTo(tr);
    tdFreq.appendTo(tr);
    tdNextArvl.appendTo(tr);
    tdMinAwy.appendTo(tr);
    tdEdit.appendTo(tr);
    tdDel.appendTo(tr);

    // add to train array and local storage
    trainArry["train" + tRows.length] = currentTrain;
    console.log("in addTrain:");
    console.log(trainArry);
    localStorage.setItem("trains", JSON.stringify(trainArry));
}

$(document).ready(function() {

    initPage();

    $("#btnAddTrain").on("click", function(event) {
        // event.preventDefault();

        addTrain();

        // reset inputs to defaults
        $("#inptTrainName").val("");
        $("#inptDestination").val("");
        $("#inptFirstTime").val("16:00:00");
        $("#inptFreq").val(15);
    });

    $("body").on("click touch", ".delete-row", function() {
        var id = $(this).attr("id");
        var idLen = id.length;
        id.split("");
        // console.log(id[idLen - 1]);
        $("#row" + id[idLen - 1]).remove();

        // pull that element out of the train array
        delete trainArry["train" + id[idLen - 1]];

        localStorage.setItem("trains", JSON.stringify(trainArry));
        // console.log("in delete-row:");
        // console.log(trainArry);

    });

    $("body").on("click touch", ".edit-row", function() {
        var id = $(this).attr("id");
        var idLen = id.length;
        id.split("");
        // console.log(id[idLen - 1]); 

        // get the data from the train array into currentTrain object
        currentTrain = trainArry["train" + id[idLen - 1]];

        // pull that item out of the train array
        delete trainArry["train" + id[idLen - 1]];

        // update localStorage
        localStorage.setItem("trains", JSON.stringify(trainArry));

        // remove the row from the table
        $("#row" + id[idLen - 1]).remove();

        // console.log("in delete-row:");
        // console.log(trainArry);

        // pull the data out of the currentTrain and put it back into the form

        $("#inptTrainName").val(currentTrain.name);
        $("#inptDestination").val(currentTrain.dest);
        $("#inptFirstTime").val(currentTrain.firstTime);
        $("#inptFreq").val(currentTrain.freq);

    });


    $(window).resize(function() {
        // reSize();
    });

    // reSize();
});
