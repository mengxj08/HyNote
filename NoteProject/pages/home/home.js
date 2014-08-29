(function () {
    "use strict";
    var SampleComponent = new Component.SampleComponent();
    var resultJson;
    //var winNavBar;
    var winAppBar;
    var passedOptions = null
    var homePage = WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            passedOptions = options;

            winAppBar = document.getElementById("homeAppbar").winControl;
            
            element.querySelector("#AddtoProject").addEventListener("click", this.doClickAddtoProject, false);
            element.querySelector("#reviewNotes").addEventListener("click", this.doClickreviewNotes, false);
            //element.querySelector("#open").addEventListener("click", this.doClickOpen, false);
            //element.querySelector("#save").addEventListener("click", this.doClickSave, false);
            element.querySelector("#delete").addEventListener("click", this.doClickDelete, false);

            var conceptShow = document.getElementById("conceptShow");
            var constantWidth = $("#conceptShow").outerWidth(true) + $("#textShow").outerWidth(true);
            
            var testButton = document.getElementById("Button");
            testButton.addEventListener("click", this.testButtonClicked, false);

 
            //*************************************************************************
            //Codes below are designed for resizable conceptMap

            $("#conceptShow").resizable({
                helper: "ui-resizable-helper",
                maxHeight: conceptShow.clientHeight,
                minHeight: conceptShow.clientHeight,
                stop: function (event, ui) {
                    var textShowouterWidth = constantWidth - $("#conceptShow").outerWidth(true);
                    $("#contentGrid").css("-ms-grid-columns", $("#conceptShow").outerWidth(true) + "px " + textShowouterWidth + "px");
                    updateSize($("#conceptShow").width(), $("#conceptShow").height());
                }
            });
            //***************************************************************************
            width = $("#conceptShow").width();
            height = $("#conceptShow").height();
            drawingD3();

            $(".inputText").keyup(function (e) {
                if (e.keyCode == 13) {
                    // Do something
                    var inputText = $(".inputText").val();
                    inputText = inputText.trim();
                    console.log(inputText);
                    updateLinkLabelName(inputText);
                    $(".inputText").val("");
                    $(".inputText").css({ "visibility": "hidden" });
                }
            });
        },

        //buttonClickHandler: function(eventInfo){
        //    var userName = document.getElementById("nameInput").value;
        //    var greetingString = "Hello, " + userName + "!";
        //    document.getElementById("greetingOutput").innerText = greetingString;
        //},

        //ratingChanged: function (eventInfo) {
        //    var ratingOutput = document.getElementById("ratingOutput");
        //    ratingOutput.innerText = eventInfo.detail.tentativeRating;
        //},

        //nameInputChanged: function (eventInfo) {
        //    var nameInput = eventInfo.srcElement;
        //},

        //AppBar Command button function
        doClickAddtoProject: function () {

        },

        doClickreviewNotes: function () {
            if (!passedOptions)
                WinJS.Navigation.navigate("/pages/page2/page2.html");
            else { }
        },

        doClickOpen: function () {
            var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
            //openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
            openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
            openPicker.fileTypeFilter.replaceAll([".json"]);
            
            openPicker.pickSingleFileAsync().then(function (file) {
                if (file) {
                    Windows.Storage.CachedFileManager.deferUpdates(file);
                    Windows.Storage.FileIO.readTextAsync(file).done(function (contents) {
                        var readJson = JSON.parse(contents);
                        //console.log(readJson);
                        var textShow = document.getElementById("textShow");
                        textShow.innerText = readJson.text;
                        nodes = readJson.node;
                        links = readJson.link;
                        linkstoNodes();

                        force.nodes(nodes);
                        force.links(links);
                       
                        restartNodes();
                        restartLinks();
                        restartLabels();

                        passedOptions = null;
                    });
                }
                else {
                }
            });

            //WinJS.Navigation.navigate("/pages/home/home.html");
        },

        doClickSave: function () {
            var savePicker = new Windows.Storage.Pickers.FileSavePicker();
            savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
            savePicker.fileTypeChoices.insert("Json", [".json"]);
            savePicker.suggestedFileName = "New Document";

            var textShow = document.getElementById("textShow");
            var savedString = saveNoteToFile(textShow.innerText);
            savePicker.pickSaveFileAsync().then(function (file) {
               
                if (file) {
                    Windows.Storage.CachedFileManager.deferUpdates(file);
                    // write to file
                    Windows.Storage.FileIO.writeTextAsync(file, savedString).done(function () {
                        Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus) {
                            if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                                //WinJS.log && WinJS.log("File " + file.name + " was saved.", "sample", "status");
                            } else {
                                //WinJS.log && WinJS.log("File " + file.name + " couldn't be saved.", "sample", "status");
                            }
                        });
                    });
                } else {
                    //WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
                }
            });
        },

        doClickDelete: function () {
            var textShow = document.getElementById("textShow");
            textShow.innerText = "";
            nodes = [];
            links = [];
            force.nodes(nodes);
            force.links(links);
            restartLinks();
            restartLabels();
            restartNodes();

            passedOptions = null;
            //winNavBar.hide();
            winAppBar.hide();
        },

        //linkClickEventHandler: function (eventInfo) {
        //    eventInfo.preventDefault();
        //    var link = eventInfo.target;
        //    WinJS.Navigation.navigate(link.href);
        //},

        PassTextToParse: function () {
            console.log("passtextParse");
            var textShow = document.getElementById("textShow");
            resultJson = SampleComponent.getResultJson(textShow.innerText);
            console.log(resultJson);
            analyseNodes(resultJson);
        },

        testButtonClicked: function (eventInfo) {
            homePage.prototype.PassTextToParse();
        }

    });



})();
