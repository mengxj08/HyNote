var setupDataset = function () {
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
};
