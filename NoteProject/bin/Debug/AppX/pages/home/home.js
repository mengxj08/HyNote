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
            element.querySelector("#undoNote").addEventListener("click", this.doClickUndoButton, false);


            var conceptShow = document.getElementById("conceptShow");
            var constantWidth = $("#conceptShow").outerWidth(true) + $("#textShow").outerWidth(true);
            
            //var testButton = document.getElementById("mapButton");
            //testButton.addEventListener("click", this.testButtonClicked, false);

 
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
            this.saveCurrentState();

            $(".inputText").keyup(function (e) {
                if (e.keyCode == 13) {
                    // Do something
                    var inputText = $(".inputText").val();
                    inputText = inputText.trim();
                    if (selectedLinkObj) {
                        updateLinkLabelName(inputText);
                    }
                    else if (selectedNodeObj) {
                        updateNoteNodeWord(inputText);
                    }
                    else { console.log("No update while type enter in inputText."); }
                }
            });

            $("#title").focusin(function () {
                var titleName = document.getElementById("title");
                if (titleName.innerText.trim() == "Click to name Note...") {
                    titleName.innerText = "";
                }
            });

            $("#textShow").focusin(function () {
                var textShow = document.getElementById("textShow");
                if (textShow.innerText.trim() == "Click to take notes...") {
                    textShow.innerText = "";
                }
            });

            $("#textShow").keyup(function (e) {
                if (e.keyCode == 32 || e.keyCode == 13 || (e.keyCode >= 106 && e.keyCode <= 222)) {
                    homePage.prototype.localTextParsing();

                }
            });
        },

        //AppBar Command button function
        doClickUndoButton: function () {
            hideSelectedLink1();
            homePage.prototype.readCurrenState();
        },

        doClickAddtoProject: function () {
            homePage.prototype.saveCurrentState();
            if (passedOptions) {
                //modify the corresponding DataExample.itemList
                var passedItemChecked = false;
                DataExample.itemList.forEach(function (itemValue, itemIndex) {
                    if (itemValue.Index == passedOptions.Index) {
                        itemValue.Title = DataExample.currentNoteState.Title;
                        itemValue.Data = DataExample.currentNoteState.Data;
                        passedItemChecked = itemValue.checked;
                        return;
                    }
                });
                if (passedItemChecked)
                    WinJS.Navigation.navigate("/pages/page2/page2.html", passedOptions);
                else
                    WinJS.Navigation.navigate("/pages/page2/page2.html");
            }
            else {
                //Add the new note to the project
                if (DataExample.itemList.length == 0)
                    var index = DataExample.itemList.length;
                else {
                    var index = DataExample.itemList.getAt(DataExample.itemList.length - 1).Index + 1;
                }
                DataExample.itemList.push(WinJS.Binding.as({ "Title": DataExample.currentNoteState.Title, "Index": index, "checked": false, "Color": "darkgrey", "Data": DataExample.currentNoteState.Data }));
                WinJS.Navigation.navigate("/pages/page2/page2.html");
            }
            passedOptions = null;
            DataExample.currentNoteState = {};
        },

        //doClickreviewNotes: function () {
        //    homePage.prototype.saveCurrentState();
        //    if (!passedOptions) {
        //        //record the current note into memory
        //    }
        //    else {
        //        //modify the corresponding DataExample.itemList
        //        DataExample.itemList.forEach(function (itemValue, itemIndex) {
        //            if (itemValue.Index == passedOptions.Index)
        //            {
        //                itemValue.Title = DataExample.currentNoteState.Title;
        //                itemValue.Data = DataExample.currentNoteState.Data;
        //                return;
        //            }
        //        });

        //        DataExample.currentNoteState = {};
        //    }
        //    passedOptions = null;
        //    WinJS.Navigation.navigate("/pages/page2/page2.html");
        //},

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
            if (selectedNodeObj) {
                selectedNodeObj.connecting = false;
            }
                
            var textShow = document.getElementById("textShow");
            //var modifiedText = textShow.innerText.trim().replace("\r\n", "1");
            var text = textShow.innerText.trim();
            
            var find = "\r\n\r\n"
            var re = new RegExp(find, 'g');
            text = text.replace(re, '\r\n');
            var savedString = saveNoteToFile(text);
            var titleName = document.getElementById("title");
            DataExample.currentNoteState.Title = titleName.innerText.trim();
            DataExample.currentNoteState.Data = savedString;
            console.log("CurrentData"+DataExample.currentNoteState.Data);
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

        localTextParsing: function () {
            var textShow = document.getElementById("textShow").innerText;
            textShow = textShow.trim();
            var localJson = [];
            var tmpCache = JSON.parse(DataExample.cache);
            var punctuationless = textShow.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g, '');
            var finalString = punctuationless.replace(/\s{2,}/g, " ");
            console.log("FFFF:"+finalString);
            var words = finalString.split(" ");
            console.log(DataExample.nounList.length);
            words.forEach(function (wordValue, wordIndex) {
                var isExisted = false;
                var tmp = wordValue.trim();
                console.log(tmp);
                localJson.forEach(function (JsonValue, JsonIndex) {
                    if (JsonValue.word.toUpperCase() == tmp.toUpperCase()) {
                        isExisted = true;
                        JsonValue.frequency++;
                    }
                });

                if (!isExisted) {
                    var isNoun = false;
                    for (var i = 0; i < tmpCache.length; i++) {
                        if (tmp.toUpperCase() == tmpCache[i].word.toUpperCase()) {
                            isNoun = tmpCache[i].isNoun;
                            break;
                        }
                    }
                    if (isNoun) {
                        localJson.push({ "word": tmp, "frequency": 1 });
                    }
                    else {
                        var isNewNoun = false;
                        for (var i = 0; i < DataExample.nounList.length; i++) {
                            if (DataExample.nounList[i].toUpperCase() == tmp.toUpperCase()) {
                                localJson.push({ "word": tmp, "frequency": 1 });
                                tmpCache.push({ "word": tmp, "isNoun": true });
                                isNewNoun = true;
                                break;
                            }
                        }

                        if (!isNewNoun) {
                            tmpCache.push({ "word": tmp, "isNoun": false });
                        }
                    }
                }
            });
            var finalJson = {};
            DataExample.cache = JSON.stringify(tmpCache);
            finalJson.nodes = localJson;
            analyseNodes(JSON.stringify(finalJson));
        },

        PassTextToParse: function () {
            //$("#ProgressControl").css({ "visibility": "visible" });
            //console.log("passtextParse");
            var textShow = document.getElementById("textShow");
            resultJson = SampleComponent.getResultJson(textShow.innerText);
            //textShow.innerText = textShow.innerText;
            //console.log(resultJson);
            var progressControl = document.getElementById("ProgressControl");
            progressControl.style.visibility = "hidden";
            if (resultJson != "N/A") {
                analyseNodes(resultJson);
            }
            else {
                console.log("Internet is slow. Try again please...");
                var errorMsg = document.getElementById("errorMsg");
                errorMsg.style.visibility = "visible";
                setTimeout(function () {
                    errorMsg.style.visibility = "hidden";
                }, 1000);
            }
        },

        testButtonClicked: function (eventInfo) {
            //var promise = new WinJS.Promise.as().then(homePage.prototype.refreshProgressBar()).then(homePage.prototype.PassTextToParse());
            //var progressControl = document.getElementById("ProgressControl");
            //progressControl.style.visibility = "visible";
            //setTimeout(function () { console.log("fuck"); progressControl.style.visibility = "hidden"; }, 2000);
            //console.log(DataExample.nounList[0]);
            var errorMsg = document.getElementById("errorMsg");
            errorMsg.style.visibility = "hidden";
            homePage.prototype.refreshProgressBar("Loading...");
            setTimeout(function () {
                homePage.prototype.PassTextToParse();
                //var textShow = document.getElementById("textShow");
                //resultJson = SampleComponent.localJsonResult(textShow.innerText);
            }, 200);
           
            //WinJS.UI.Pages.render("/pages/home/home.html", progressControl, {}, setTimeout(2000)).done(homePage.prototype.refreshProgressBar());
        },

        refreshProgressBar: function (showText) {
            var progressControl = document.getElementById("ProgressControl");
            //$("#ProgressControl").text(showText);
            progressControl.style.visibility = "visible";
            WinJS.Resources.processAll(progressControl);
        }

    });



})();
