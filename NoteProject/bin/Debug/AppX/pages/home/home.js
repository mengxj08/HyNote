(function () {
    "use strict";
    var SampleComponent = new Component.SampleComponent();
    var resultJson;
    
    var homePage = WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            //var ratingControlDiv = document.getElementById("ratingControlDiv");

            //var ratingControl = ratingControlDiv.winControl;

            //ratingControl.addEventListener("change", this.ratingChanged, false);

            //var helloButton = document.getElementById("helloButton");
            //helloButton.addEventListener("click", this.buttonClickHandler, false);

            //var nameInput = document.getElementById("nameInput");
            //nameInput.addEventListener("change", this.nameInputChanged, false);

            //WinJS.Utilities.query("a").listen("click", this.linkClickEventHandler, false);
            
            var conceptShow = document.getElementById("conceptShow");
            var constantWidth = $("#conceptShow").outerWidth(true) + $("#textShow").outerWidth(true);
            
            var testButton = document.getElementById("testButton");
            testButton.addEventListener("click", this.testButtonClicked, false);

            //var wall = new freewall("#keyWordMap");
            //wall.fitWidth();

            $("#conceptShow").resizable({
                //animate: true,
                helper: "ui-resizable-helper",
                maxHeight: conceptShow.clientHeight,
                minHeight: conceptShow.clientHeight,
                stop: function (event, ui) {
                    // $("#textShow").width(constantWidth - $("#conceptShow").width());
                    //$("#contentGrid").css("-ms-grid-columns", $("#conceptShow").outerWidth(true) + "px 1fr");
                    var textShowouterWidth = constantWidth - $("#conceptShow").outerWidth(true);
                    $("#contentGrid").css("-ms-grid-columns", $("#conceptShow").outerWidth(true) + "px " + textShowouterWidth + "px");
                    //console.log("textShow:" + $("#textShow").width());
                    //wall.fitWidth();
                }
            });

            drawingD3();
            
            //var temp = new Component.SampleComponent();
            //temp.initialAnalysis();
            //var temp = new Component.SampleComponent().GetResultJson("I like Beijing");
            //console.log(temp);

            //var localFolder = Windows.Storage.ApplicationData.current.localFolder.path.toString();
            //console.log(localFolder);

            //var installedFolder = Windows.ApplicationModel.Package.current.installedLocation;
            //console.log(installedFolder.path.toString());



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

        linkClickEventHandler: function (eventInfo) {
            eventInfo.preventDefault();
            var link = eventInfo.target;
            WinJS.Navigation.navigate(link.href);
        },

        PassTextToParse: function () {
            console.log("passtextParse");
            var textShow = document.getElementById("textShow");
            resultJson = SampleComponent.getResultJson(textShow.innerText);
            console.log(resultJson);
            //updateJsonData(resultJson);
            restartNodes(resultJson);
        },

        testButtonClicked: function (eventInfo) {
            homePage.prototype.PassTextToParse();
        }

    });



})();
