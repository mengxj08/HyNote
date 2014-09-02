var setupDataset = function () {
    var dataArray = [
    //{ Title: "Basic banana", Index: "Low-fat frozen yogurt", checked: true, data:"test"},
    //{ title: "Banana blast", text: "Ice cream", data: "test" },
    ];

    var itemList = new WinJS.Binding.List(dataArray);

    var currentNoteState = {};
    var currentProjectState = {};

    // Create a namespace to make the data publicly accessible. 
    var publicMembers =
        {
            itemList: itemList,
            currentNoteState: currentNoteState,
            currentProjectState: currentProjectState
        };
    WinJS.Namespace.define("DataExample", publicMembers);
};
