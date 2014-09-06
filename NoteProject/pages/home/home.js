(function () {
    "use strict";
    var SampleComponent = new Component.SampleComponent();
    var resultJson;
    //var winNavBar;
    var winAppBar;
    var passedOptions = null;
    var homePage = WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            passedOptions = options;

            winAppBar = document.getElementById("homeAppbar").winControl;
            
            element.querySelector("#right-button").addEventListener("click", this.doClickAddtoProject, false);
            //element.querySelector("#reviewNotes").addEventListener("click", this.doClickreviewNotes, false);
            //element.querySelector("#open").addEventListener("click", this.doClickOpen, false);
            //element.querySelector("#save").addEventListener("click", this.doClickSave, false);
            element.querySelector("#delete").addEventListener("click", this.doClickDelete, false);

            var conceptShow = document.getElementById("conceptShow");
            var constantWidth = $("#conceptShow").outerWidth(true) + $("#textShow").outerWidth(true);
            
            var testButton = document.getElementById("mapButton");
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
            this.readPassedOptions();

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

        //AppBar Command button function
        doClickAddtoProject: function () {
            homePage.prototype.saveCurrentState();
            if (passedOptions) {
                //modify the corresponding DataExample.itemList
                DataExample.itemList.forEach(function (itemValue, itemIndex) {
                    if (itemValue.Index == passedOptions.Index) {
                        itemValue.Title = DataExample.currentNoteState.Title;
                        itemValue.Data = DataExample.currentNoteState.Data;
                        return;
                    }
                });

                DataExample.currentNoteState = {};
            }
            else {
                //Add the new note to the project
                if (DataExample.itemList.length == 0)
                    var index = DataExample.itemList.length;
                else {
                    var index = DataExample.itemList.getAt(DataExample.itemList.length - 1).Index + 1;
                }
                DataExample.itemList.push(WinJS.Binding.as({ "Title": DataExample.currentNoteState.Title, "Index": index, "checked": false, "Color": "darkgrey", "Data": DataExample.currentNoteState.Data }));
            }
            passedOptions = null;
            WinJS.Navigation.navigate("/pages/page2/page2.html");
        },

        doClickreviewNotes: function () {
            homePage.prototype.saveCurrentState();
            if (!passedOptions) {
                //record the current note into memory
            }
            else {
                //modify the corresponding DataExample.itemList
                DataExample.itemList.forEach(function (itemValue, itemIndex) {
                    if (itemValue.Index == passedOptions.Index)
                    {
                        itemValue.Title = DataExample.currentNoteState.Title;
                        itemValue.Data = DataExample.currentNoteState.Data;
                        return;
                    }
                });

                DataExample.currentNoteState = {};
            }
            passedOptions = null;
            WinJS.Navigation.navigate("/pages/page2/page2.html");
        },

        readPassedOptions: function () {
            if (passedOptions) {
                DataExample.itemList.forEach(function (itemValue, itemIndex) {
                    if (itemValue.Index == passedOptions.Index) {
                        var titleName = document.getElementById("title");
                        titleName.innerText = itemValue.Title;
                        var readJson = JSON.parse(itemValue.Data);
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
                        return;
                    }
                });
                DataExample.currentNoteState = {};
            }
            else if (DataExample.currentNoteState.Title) {
                homePage.prototype.readCurrenState();
            }
            else{}
        },

        saveCurrentState: function () {
            var textShow = document.getElementById("textShow");
            var savedString = saveNoteToFile(textShow.innerText.trim());
            var titleName = document.getElementById("title");
            DataExample.currentNoteState.Title = titleName.innerText.trim();
            DataExample.currentNoteState.Data = savedString;
            console.log(DataExample.currentNoteState);
        },

        readCurrenState: function () {
            var titleName = document.getElementById("title");
            titleName.innerText = DataExample.currentNoteState.Title;
            console.log(titleName.innerText);
            var readJson = JSON.parse(DataExample.currentNoteState.Data);
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
        },
        //doClickOpen: function () {
        //    var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        //    //openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        //    openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
        //    openPicker.fileTypeFilter.replaceAll([".json"]);
            
        //    openPicker.pickSingleFileAsync().then(function (file) {
        //        if (file) {
        //            Windows.Storage.CachedFileManager.deferUpdates(file);
        //            Windows.Storage.FileIO.readTextAsync(file).done(function (contents) {
        //                var readJson = JSON.parse(contents);
        //                //console.log(readJson);
        //                var textShow = document.getElementById("textShow");
        //                textShow.innerText = readJson.text;
        //                nodes = readJson.node;
        //                links = readJson.link;
        //                linkstoNodes();

        //                force.nodes(nodes);
        //                force.links(links);
                       
        //                restartNodes();
        //                restartLinks();
        //                restartLabels();

        //                passedOptions = null;
        //            });
        //        }
        //        else {
        //        }
        //    });

        //    //WinJS.Navigation.navigate("/pages/home/home.html");
        //},

        //doClickSave: function () {
        //    var savePicker = new Windows.Storage.Pickers.FileSavePicker();
        //    savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
        //    savePicker.fileTypeChoices.insert("Json", [".json"]);
        //    savePicker.suggestedFileName = "New Document";

        //    var textShow = document.getElementById("textShow");
        //    var savedString = saveNoteToFile(textShow.innerText);
        //    savePicker.pickSaveFileAsync().then(function (file) {
               
        //        if (file) {
        //            Windows.Storage.CachedFileManager.deferUpdates(file);
        //            // write to file
        //            Windows.Storage.FileIO.writeTextAsync(file, savedString).done(function () {
        //                Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus) {
        //                    if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
        //                        //WinJS.log && WinJS.log("File " + file.name + " was saved.", "sample", "status");
        //                    } else {
        //                        //WinJS.log && WinJS.log("File " + file.name + " couldn't be saved.", "sample", "status");
        //                    }
        //                });
        //            });
        //        } else {
        //            //WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
        //        }
        //    });
        //},

        doClickDelete: function () {
            var textShow = document.getElementById("textShow");
            textShow.innerText = "Click to take notes...";

            var title = document.getElementById("title");
            title.innerText = "Click to name Note...";

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

        PassTextToParse: function () {
            //$("#ProgressControl").css({ "visibility": "visible" });
            //console.log("passtextParse");
            var textShow = document.getElementById("textShow");
            resultJson = SampleComponent.getResultJson(textShow.innerText);
            console.log(resultJson);
            analyseNodes(resultJson);
            var progressControl = document.getElementById("ProgressControl");
            progressControl.style.visibility = "hidden";
            //$("#ProgressControl").css({ "visibility": "hidden" });
        },

        testButtonClicked: function (eventInfo) {
            //var promise = new WinJS.Promise.as().then(homePage.prototype.refreshProgressBar()).then(homePage.prototype.PassTextToParse());
            //var progressControl = document.getElementById("ProgressControl");
            //progressControl.style.visibility = "visible";
            //setTimeout(function () { console.log("fuck"); progressControl.style.visibility = "hidden"; }, 2000);
            homePage.prototype.refreshProgressBar();
            setTimeout(function () {
                homePage.prototype.PassTextToParse();
            }, 200);
           
            //WinJS.UI.Pages.render("/pages/home/home.html", progressControl, {}, setTimeout(2000)).done(homePage.prototype.refreshProgressBar());
        },

        refreshProgressBar: function () {
            var progressControl = document.getElementById("ProgressControl");
            progressControl.style.visibility = "visible";
            WinJS.Resources.processAll(progressControl);
        }

    });



})();
