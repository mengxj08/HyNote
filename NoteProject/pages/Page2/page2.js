// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    //var winNavBar;
    var winAppBar;
    var page2options = null;
    var page2Timeout = null;
    var canSave = true;
    var page2obj = WinJS.UI.Pages.define("/pages/Page2/page2.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            //winNavBar = document.getElementById("navbar").winControl;
            winAppBar = document.getElementById("page2Appbar").winControl;
            page2options = options;
            element.querySelector("#left-button").addEventListener("click", this.doClickNewNote, false);
            element.querySelector("#open").addEventListener("click", this.doClickOpen, false);
            element.querySelector("#save").addEventListener("click", this.doClickSave, false);
            element.querySelector("#delete").addEventListener("click", this.doClickDelete, false);
            element.querySelector("#undoProject").addEventListener("click", this.doClickUndoProject, false);
            //element.querySelector("#remove").addEventListener("click", this.doClickRemove, false);
             
            WinJS.Namespace.define("utility", { itemButtonClick: this.itemButtonClick });
            WinJS.Namespace.define("utility", { toggleSwitchChange: this.toggleSwitchChange });
            WinJS.Utilities.markSupportedForProcessing(this.toggleSwitchChange);

            this.dataBindingProcess();

            var viewListView = element.querySelector("#viewListView").winControl;
            viewListView.addEventListener("selectionchanged",this.selectionChanged);
            viewListView.layout.orientation = "vertical";

            width = $("#conceptShow2").width();
            height = $("#conceptShow2").height();

            multiDrawingD3();
            this.readPassedOptions();
            this.updateFile();

            $(".inputText2").keyup(function (e) {
                if (e.keyCode == 13) {
                    // Do something
                    var inputText = $(".inputText2").val();
                    inputText = inputText.trim();
                    //console.log(inputText);
                    if (selectedLinkObj) {
                        updateLinkLabelName(inputText);
                    }
                    else if (selectedNodeObj)
                    {
                        updateNodeWord(inputText);
                    }
                    else { console.log("No update while type enter in inputText.");}
                    
                }
            });

            $("#titleProject").focusin(function () {
                var titleProject = document.getElementById("titleProject");
                if (titleProject.innerText.trim() == "Click to name Project...") {
                    titleProject.innerText = "";
                }
            });
        },
        selectionChanged: function (event) {
            var viewListView = document.getElementById("viewListView").winControl;
            if (viewListView.selection.count() != 0) {
                //No selected items
                //winAppBar.show();
            }
        },
        itemButtonClick: function (event) {
            //console.log(event.name + "---" + event.value);

            page2obj.prototype.saveProjectToNote(event.name);

            DataExample.itemList.forEach(function (itemValue, itemIndex) {
                if (itemValue.Index == event.name)
                {
                    if (itemValue.checked)
                    {
                        itemValue.checked = false;
                        var readJson = JSON.parse(itemValue.Data);
                        removeNodesAndLinks(readJson.node, readJson.link);

                        restartNodes();
                        restartLinks();
                        restartLabels();
                    }
                    return;
                }
            });
            page2obj.prototype.saveProjectState();
            WinJS.Navigation.navigate("/pages/home/home.html", {"Index":event.name});
        },
        saveProjectToNote: function (itemValueIndex) {
            //page2obj.prototype.saveProjectState();
            DataExample.itemList.forEach(function (itemValue, itemIndex) {
                if (itemValue.Index == itemValueIndex) {
                    var readJson = JSON.parse(itemValue.Data);
                    //console.log(itemValue.Data);
                    readJson.node.forEach(function (JsonNodeValue, JsonNodeIndex) {
                        nodes.forEach(function (nodeValue, nodeIndex) {
                            if (JsonNodeValue.word.toUpperCase() == nodeValue.word.toUpperCase()) {
                                var frequency = JsonNodeValue.frequency;
                                JsonNodeValue = nodeValue;
                                JsonNodeValue.frequency = frequency;
                                if (JsonNodeValue.connecting) {
                                    changeItemViewColor(JsonNodeValue,false);
                                    JsonNodeValue.connecting = false;
                                    selectedNode = null;
                                    selectedNodeObj = null;
                                }
                                
                                readJson.node[JsonNodeIndex] = JsonNodeValue;
                                return;
                            }
                        });
                    });

                    for (var i = 0; i < readJson.link.length; i++) {
                        var delLink = true;
                        var JsonLinkValue = readJson.link[i];
                        links.forEach(function (linkValue, linkIndex) {
                            if (JsonLinkValue.source.word.toUpperCase() == linkValue.source.word.toUpperCase() && JsonLinkValue.target.word.toUpperCase() == linkValue.target.word.toUpperCase()) {
                                delLink = false;
                                JsonLinkValue.linkName = linkValue.linkName;
                                JsonLinkValue.linkType = linkValue.linkType;
                                return;
                            }
                        });

                        if (delLink) {
                            readJson.link.splice(i--,1);
                        }
                    }

                    //Add to ExternalLinks
                    var externalLinks = JSON.parse(DataExample.externalLinks);
                    console.log("aaaaaaa:"+DataExample.externalLinks);
                    links.forEach(function (linkValue, linkIndex) {
                        if (linkValue.external) {
                            for (var i = 0; i < readJson.node.length; i++) {
                                if (linkValue.source.word.toUpperCase() == readJson.node[i].word.toUpperCase() || linkValue.target.word.toUpperCase() == readJson.node[i].word.toUpperCase()) {
                                    externalLinks.push(linkValue);
                                    console.log("TTTTTTT");
                                    break;
                                }
                            }
                        }
                    });
                    DataExample.externalLinks = JSON.stringify(externalLinks);

                    var newItemValueData = JSON.stringify(readJson);
                    itemValue.Data = newItemValueData;
                    console.log("bbbbbbb:" + DataExample.externalLinks);
                    return;
                }
            });
        },
        toggleSwitchChange: function (event) {
            console.log("toggleSwitchChange");
            var index = event.srcElement.title;
            //console.log("index:"+index);
            DataExample.itemList.forEach(function (itemValue, itemIndex) {
                if (itemValue.Index == index)
                {
                    itemValue.checked = !itemValue.checked;
                    var readJson = JSON.parse(itemValue.Data);

                    if (itemValue.checked) {
                        mergeNodesAndLinks(readJson.node, readJson.link);
                        mergeExternalLinks();
                        linkstoNodes();

                        restartNodes();
                        restartLinks();
                        restartLabels();
                    }
                    else {
                        page2obj.prototype.saveProjectToNote(index);

                        removeNodesAndLinks(readJson.node, readJson.link);

                        restartNodes();
                        restartLinks();
                        restartLabels();
                    }
                    return;
                }
            });
        },

        doClickUndoProject: function () {
            hideSelectedLink2();
            page2obj.prototype.readProjectState();
        },
        doClickNewNote: function () {
            page2obj.prototype.saveProjectState();
            WinJS.Navigation.navigate("/pages/home/home.html");
        },

        doClickOpen: function () {
            var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
            //openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
            openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
            openPicker.fileTypeFilter.replaceAll([".project"]);

            openPicker.pickSingleFileAsync().then(function (file) {
                if (file) {
                    Windows.Storage.CachedFileManager.deferUpdates(file);
                    DataExample.storageFile = file;
                    Windows.Storage.FileIO.readTextAsync(file).done(function (contents) {
                        var JsonObject = JSON.parse(contents)
                        var readJson = JsonObject.currentState;
                        var dataExample = JsonObject.projectData;
                        var addExternalLinks = JsonObject.externalLinks;

                        var externalLinks = Json.parse(DataExample.externalLinks);
                        addExternalLinks.forEach(function (newExternalLink, newExternalIndex) {
                            externalLinks.push(newExternalLink);
                        });
                        DataExample.externalLinks = Json.stringify(externalLinks);

                        var titleName = document.getElementById("titleProject");
                        titleName.innerText = JsonObject.ProjectName;
                        
                        mergeNodesAndLinks(readJson.node, readJson.link);
                        mergeExternalLinks();
                        linkstoNodes();

                        restartNodes();
                        restartLinks();
                        restartLabels();

                        dataExample.forEach(function (dataValue, dataIndex) {
                            //should consider the Index of dataValue
                            //Need to be fixed
                            if (DataExample.itemList.length == 0)
                                var index = DataExample.itemList.length;
                            else {
                                var index = DataExample.itemList.getAt(DataExample.itemList.length - 1).Index + 1;
                            }
                            dataValue.Index = index;
                            DataExample.itemList.push(WinJS.Binding.as(dataValue));
                        });

                        page2obj.prototype.saveProjectState();
                    });
                }
                else {
                }
            });
        },

        doClickSave: function () {
            if (DataExample.storageFile) {
                page2obj.prototype.autoSaving();
                return;
            }

            var savePicker = new Windows.Storage.Pickers.FileSavePicker();
            savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
            savePicker.fileTypeChoices.insert("Project", [".project"]);

            page2obj.prototype.saveProjectState();
            if (DataExample.currentProjectState.Title != "Click to name Project..." && DataExample.currentProjectState.Title != "") {
                savePicker.suggestedFileName = DataExample.currentProjectState.Title;
            }
            else {
                savePicker.suggestedFileName = "New Document";
            }
            //var dataExample = DataExample.itemList.slice(0);
            var dataExample = [];
            DataExample.itemList.forEach(function (itemValue, itemIndex) {
                dataExample.push({ Title: itemValue.Title, Index: itemValue.Index, checked: itemValue.checked, Color: itemValue.Color, Data: itemValue.Data });
            });
            //var titleName = document.getElementById("titleProject");
            var savedString = { "ProjectName": DataExample.currentProjectState.Title, "currentState": JSON.parse(DataExample.currentProjectState.Data), "projectData": dataExample, "externalLinks": JSON.parse(DataExample.externalLinks) };
            savedString = JSON.stringify(savedString);
            //savedString = savedString.toString();
            savePicker.pickSaveFileAsync().then(function (file) {

                if (file) {
                    Windows.Storage.CachedFileManager.deferUpdates(file);
                    // write to file
                    DataExample.storageFile = file;
                    Windows.Storage.FileIO.writeTextAsync(file, savedString).done(function () {
                         Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus) {
                                if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                                    canSave = true;
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
            var viewListView = document.getElementById("viewListView").winControl;
            if (viewListView.selection.count() == 0) {
                //No selected items
            }
            else {
                viewListView.selection.getItems().done(function (selectedDataSource) {
                    var contents = selectedDataSource[0].data.Data.toString();
                    //var fileTitle = selectedDataSource[0].data.Title.toString();
                    var fileIndex = selectedDataSource[0].data.Index;
                    var toggleChecked = false;
                    //console.log(contents);
                    viewListView.selection.clear();

                    DataExample.itemList.forEach(function (itemValue, itemIndex) {//del single item
                        if (itemValue.Index == fileIndex) {
                            toggleChecked = itemValue.checked;
                            DataExample.itemList.splice(itemIndex, 1);
                            return;
                        }
                    });
                    //for (var i = 0; i < DataExample.itemList.length; i++) //del Multi-item
                    //{
                    //    if (DataExample.itemList.getAt(i).title == fileTitle)
                    //    {
                    //        DataExample.itemList.splice(i--, 1);
                    //        break;
                    //    }
                    //}
                    if (toggleChecked) {
                        var readJson = JSON.parse(contents);
                        removeNodesAndLinks(readJson.node, readJson.link);

                        restartNodes();
                        restartLinks();
                        restartLabels();
                    }
                });
            }
            winAppBar.hide();
        },

        dataBindingProcess: function () {
            var viewListView = document.getElementById("viewListView").winControl;
            viewListView.itemDataSource = DataExample.itemList.dataSource;
        },

        saveProjectState: function () {
            if (selectedNodeObj) {
                selectedNodeObj.connecting = false;
            }
            var textShow = "N/A";
            var currentState = saveNoteToFile(textShow);

            var titleName = document.getElementById("titleProject");
            DataExample.currentProjectState.Title = titleName.innerText.trim();
            DataExample.currentProjectState.Data = currentState;
            //console.log(DataExample.currentProjectState);
        },
        readProjectState: function () {
            var titleName = document.getElementById("titleProject");
            titleName.innerText = DataExample.currentProjectState.Title;
            //console.log(titleName.innerText);
            var readJson = JSON.parse(DataExample.currentProjectState.Data);

            nodes = readJson.node;
            links = readJson.link;
            linkstoNodes();

            force.nodes(nodes);
            force.links(links);

            restartNodes();
            restartLinks();
            restartLabels();
        },
        readPassedOptions: function () {
            if (page2options) {
                page2obj.prototype.readProjectState();

            }
            else if (DataExample.currentProjectState.Title) {
                page2obj.prototype.readProjectState();
            }
            else { }
            page2options = null;

            //page2obj.prototype.autoSaving();
        },

        autoSaving: function () {
            if (DataExample.storageFile) {
                console.log("auto-saving");
                page2obj.prototype.saveProjectState();

                var dataExample = [];
                DataExample.itemList.forEach(function (itemValue, itemIndex) {
                    dataExample.push({ Title: itemValue.Title, Index: itemValue.Index, checked: itemValue.checked, Color: itemValue.Color, Data: itemValue.Data });
                });
                //var titleName = document.getElementById("titleProject");
                var savedString = { "ProjectName": DataExample.currentProjectState.Title, "currentState": JSON.parse(DataExample.currentProjectState.Data), "projectData": dataExample, "externalLinks": JSON.parse(DataExample.externalLinks) };
                savedString = JSON.stringify(savedString);

                var file = DataExample.storageFile;
                Windows.Storage.FileIO.writeTextAsync(file, savedString).done(function () {
                    Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus) {
                        if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                            //WinJS.log && WinJS.log("File " + file.name + " was saved.", "sample", "status");
                        } else {
                            //WinJS.log && WinJS.log("File " + file.name + " couldn't be saved.", "sample", "status");
                        }
                    });
                });
            }
        },

        updateFile : function () {
            //console.log("updateFile");
            page2obj.prototype.autoSaving();
            page2Timeout = setTimeout(page2obj.prototype.updateFile, 1000*60*2);
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
            //WinJS.UI.Fragments.clearCache();
            if (page2Timeout)
                clearTimeout(page2Timeout);
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
            //var viewListView = element.querySelector("#viewListView").winControl;
            //viewListView.layout.orientation = "vertical";

        }
    });
})();
