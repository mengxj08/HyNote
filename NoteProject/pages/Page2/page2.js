// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var winNavBar;
    var winAppBar;

    WinJS.UI.Pages.define("/pages/Page2/page2.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            winNavBar = document.getElementById("navbar").winControl;
            winAppBar = document.getElementById("page2Appbar").winControl;

            element.querySelector("#open").addEventListener("click", this.doClickOpen, false);
            element.querySelector("#save").addEventListener("click", this.doClickSave, false);
            element.querySelector("#delete").addEventListener("click", this.doClickDelete, false);
            element.querySelector("#remove").addEventListener("click", this.doClickRemove, false);

            this.dataBindingProcess();

            var viewListView = element.querySelector("#viewListView").winControl;
            viewListView.layout.orientation = "vertical";

            //while (DataExample.itemList.length > 0)
            //{
            //    DataExample.itemList.pop();
            //}


            width = $("#conceptShow2").width();
            height = $("#conceptShow2").height();

            multiDrawingD3();

            $(".inputText2").keyup(function (e) {
                if (e.keyCode == 13) {
                    // Do something
                    var inputText = $(".inputText2").val();
                    inputText = inputText.trim();
                    console.log(inputText);
                    if (selectedLinkObj) {
                        updateLinkLabelName(inputText);
                    }
                    else if (selectedNodeObj)
                    {
                        updateNodeWord(inputText);
                    }
                    else { console.log("No update while type enter in inputText.");}
                    
                    $(".inputText2").css({ "visibility": "hidden" });
                    $(".inputText2").val("");
                }
            });
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
                        console.log("readJson:");
                        
                        mergeNodesAndLinks(readJson.node, readJson.link);
                        linkstoNodes();

                        restartNodes();
                        restartLinks();
                        restartLabels();

                        var dateString = file.dateCreated.toString();
                        dateString = dateString.slice(0, dateString.indexOf("(")).trim();
                        DataExample.itemList.push({ "title": file.name, "text": dateString, "data": contents });
                        //if(!nodes)//First add elements to Nodes
                        //{
                        //    console.log("First add elements to Nodes");
                        //    nodes = readJson.node;
                        //    links = readJson.link;
                        //    linkstoNodes();

                        //    force.nodes(nodes);
                        //    force.links(links);

                        //    restartNodes();
                        //    restartLinks();
                        //    restartLabels();
                        //}
                        //else {//Merge new added nodes with existing nodes
                        //    console.log("Merge new added nodes with existing nodes");
                        //    mergeNodesAndLinks(readJson.node, readJson.link);
                        //    linkstoNodes();

                        //    restartNodes();
                        //    restartLinks();
                        //    restartLabels();
                        //}
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

            var textShow = "N/A";
            var savedString = saveNoteToFile(textShow);
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
            //var textShow = document.getElementById("textShow");
            //textShow.innerText = "";
            nodes = [];
            links = [];
            force.nodes(nodes);
            force.links(links);
            restartLinks();
            restartLabels();
            restartNodes();

            winNavBar.hide();
            winAppBar.hide();
        },

        doClickRemove: function () {
            var viewListView = document.getElementById("viewListView").winControl;
            if (viewListView.selection.count() == 0) {
                //No selected items
            }
            else {
                viewListView.selection.getItems().done(function (selectedDataSource) {
                    var contents = selectedDataSource[0].data.data.toString();
                    var fileTitle = selectedDataSource[0].data.title.toString();
                    //console.log(contents);
                    viewListView.selection.clear();

                    DataExample.itemList.forEach(function (itemValue, itemIndex) {
                        if (itemValue.title == fileTitle)
                        {
                            DataExample.itemList.splice(itemIndex, 1);
                            return;
                        }
                    });
                    //for (var i = 0; i < DataExample.itemList.length; i++)
                    //{
                    //    if (DataExample.itemList.getAt(i).title == fileTitle)
                    //    {
                    //        DataExample.itemList.splice(i--, 1);
                    //        break;
                    //    }
                    //}
                    
                    var readJson = JSON.parse(contents);
                    removeNodesAndLinks(readJson.node, readJson.link);
                    //linkstoNodes();

                    restartNodes();
                    restartLinks();
                    restartLabels();
                });
            }

            winNavBar.hide();
            winAppBar.hide();
            //var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
            ////openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
            //openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
            //openPicker.fileTypeFilter.replaceAll([".json"]);

            //openPicker.pickSingleFileAsync().then(function (file) {
            //    if (file) {
            //        Windows.Storage.CachedFileManager.deferUpdates(file);
            //        Windows.Storage.FileIO.readTextAsync(file).done(function (contents) {
            //            var readJson = JSON.parse(contents);
            //            console.log("readJson:");

            //            removeNodesAndLinks(readJson.node, readJson.link);
            //            //linkstoNodes();

            //            restartNodes();
            //            restartLinks();
            //            restartLabels();

            //            //if(!nodes)//First add elements to Nodes
            //            //{
            //            //    console.log("First add elements to Nodes");
            //            //    nodes = readJson.node;
            //            //    links = readJson.link;
            //            //    linkstoNodes();

            //            //    force.nodes(nodes);
            //            //    force.links(links);

            //            //    restartNodes();
            //            //    restartLinks();
            //            //    restartLabels();
            //            //}
            //            //else {//Merge new added nodes with existing nodes
            //            //    console.log("Merge new added nodes with existing nodes");
            //            //    mergeNodesAndLinks(readJson.node, readJson.link);
            //            //    linkstoNodes();

            //            //    restartNodes();
            //            //    restartLinks();
            //            //    restartLabels();
            //            //}
            //        });
            //    }
            //    else {
            //    }
            //});
        },

        dataBindingProcess: function () {
            var viewListView = document.getElementById("viewListView").winControl;

            var dataArray = [
                //{ title: "Basic banana", text: "Low-fat frozen yogurt", data:"test"},
                //{ title: "Banana blast", text: "Ice cream", data: "test" },
            ];

            var itemList = new WinJS.Binding.List(dataArray);

            // Create a namespace to make the data publicly accessible. 
            var publicMembers =
                {
                    itemList: itemList
                };
            WinJS.Namespace.define("DataExample", publicMembers);

            viewListView.itemDataSource = DataExample.itemList.dataSource;
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
            var viewListView = element.querySelector("#viewListView").winControl;
            viewListView.layout.orientation = "vertical";

        }
    });
})();
