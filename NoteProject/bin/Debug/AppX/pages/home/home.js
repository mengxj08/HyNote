(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
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

            WinJS.Utilities.query("a").listen("click", this.linkClickEventHandler, false);

            var conceptShow = document.getElementById("conceptShow");
            
            $("#conceptShow").resizable({
                animate: true,
                helper: "ui-resizable-helper",
                maxHeight: conceptShow.clientHeight,
                minHeight: conceptShow.clientHeight

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

        linkClickEventHandler: function (eventInfo) {
            eventInfo.preventDefault();
            var link = eventInfo.target;
            WinJS.Navigation.navigate(link.href);
        }
    });
})();
