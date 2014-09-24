var setupDataset = function () {
    var dataArray = [
     // { "Title": "Note1", "Index": 0, "checked": true, "Color": "darkgrey", "Data": "{\"text\":\"I was born in Shanxi province.\\r\\nI got my bachelor in Tsinghua University, Beijing.\\r\\nAfter that, I study in NUS, Singapore.\\r\\nNow I am working in Beijing.\",\"node\":[{\"word\":\"Shanxi\",\"frequency\":1,\"textlength\":76.2699966430664,\"index\":0,\"weight\":0,\"x\":372.8074233323518,\"y\":287.00177467662206,\"px\":372.8159224999414,\"py\":287.1001285256758},{\"word\":\"province\",\"frequency\":1,\"textlength\":94.55999755859375,\"index\":1,\"weight\":0,\"x\":320.0181559715465,\"y\":528.5915380713716,\"px\":320.08445574992873,\"py\":528.5439797984545},{\"word\":\"bachelor\",\"frequency\":1,\"textlength\":95.91000366210937,\"index\":2,\"weight\":0,\"x\":585.992838636811,\"y\":329.5622965149214,\"px\":585.9085248816634,\"py\":329.5944211758926},{\"word\":\"Tsinghua\",\"frequency\":1,\"textlength\":102.57999420166015,\"index\":3,\"weight\":1,\"x\":297.9633402740916,\"y\":389.9340618803208,\"px\":298.0357277145418,\"py\":389.95916307774166,\"fixed\":false,\"connecting\":false,\"connected\":true},{\"word\":\"University\",\"frequency\":1,\"textlength\":110.14999389648437,\"index\":4,\"weight\":0,\"x\":541.0696324003505,\"y\":529.7796859879908,\"px\":541.0511453043163,\"py\":529.7333779202646},{\"word\":\"Beijing\",\"frequency\":2,\"textlength\":75.41000366210937,\"index\":5,\"weight\":1,\"x\":478.43447228644265,\"y\":302.69358885541316,\"px\":478.41009884697416,\"py\":302.7575628381187,\"fixed\":false,\"connecting\":false,\"connected\":true},{\"word\":\"study\",\"frequency\":1,\"textlength\":59.7599983215332,\"index\":6,\"weight\":0,\"x\":448.31285456670497,\"y\":596.6238197597588,\"px\":448.32879412374114,\"py\":596.5458039388301},{\"word\":\"NUS\",\"frequency\":1,\"textlength\":52.099998474121094,\"index\":7,\"weight\":1,\"x\":425.6482315175906,\"y\":447.08643680318084,\"px\":425.6576774566364,\"py\":447.10451308998733,\"fixed\":false,\"connecting\":false,\"connected\":true},{\"word\":\"Singapore\",\"frequency\":1,\"textlength\":113.75,\"index\":8,\"weight\":1,\"x\":623.9472317150959,\"y\":449.65046355833396,\"px\":623.8654391375019,\"py\":449.6048091597839,\"fixed\":false,\"connecting\":false,\"connected\":true}],\"link\":[{\"source\":{\"word\":\"Tsinghua\",\"frequency\":1,\"textlength\":102.57999420166015,\"index\":3,\"weight\":1,\"x\":297.9633402740916,\"y\":389.9340618803208,\"px\":298.0357277145418,\"py\":389.95916307774166,\"fixed\":false,\"connecting\":false,\"connected\":true},\"target\":{\"word\":\"Beijing\",\"frequency\":2,\"textlength\":75.41000366210937,\"index\":5,\"weight\":1,\"x\":478.43447228644265,\"y\":302.69358885541316,\"px\":478.41009884697416,\"py\":302.7575628381187,\"fixed\":false,\"connecting\":false,\"connected\":true},\"linkName\":\"IN\",\"linkType\":\"Line\",\"linkIndex\":0},{\"source\":{\"word\":\"NUS\",\"frequency\":1,\"textlength\":52.099998474121094,\"index\":7,\"weight\":1,\"x\":425.6482315175906,\"y\":447.08643680318084,\"px\":425.6576774566364,\"py\":447.10451308998733,\"fixed\":false,\"connecting\":false,\"connected\":true},\"target\":{\"word\":\"Singapore\",\"frequency\":1,\"textlength\":113.75,\"index\":8,\"weight\":1,\"x\":623.9472317150959,\"y\":449.65046355833396,\"px\":623.8654391375019,\"py\":449.6048091597839,\"fixed\":false,\"connecting\":false,\"connected\":true},\"linkName\":\"IN\",\"linkType\":\"Line\",\"linkIndex\":1}]}" }
    //{ Title: "Basic banana", Index: "Low-fat frozen yogurt", checked: true, Color: "darkgrey", data:"test"},
    //{ title: "Banana blast", text: "Ice cream", data: "test" },
    ];
    //dataArray = WinJS.Binding.as(dataArray);
    var itemList = new WinJS.Binding.List(dataArray);
    

    var currentNoteState = {};
    var currentProjectState = {};
    var initialLinks = [];
    var externalLinks = JSON.stringify(initialLinks);
    var storageFile = null;
    var nounList = null;
    var tmpCache = [];
    var cache = JSON.stringify(tmpCache);
    // Create a namespace to make the data publicly accessible. 
    var publicMembers =
        {
            itemList: itemList,
            currentNoteState: currentNoteState,
            currentProjectState: currentProjectState,
            externalLinks:externalLinks,
            storageFile: storageFile,
            nounList: nounList,
            cache:cache
        };
    WinJS.Namespace.define("DataExample", publicMembers);

    //var url = new Windows.Foundation.Uri("ms-appx:///data/GreatNounList");
    //var url = new Windows.Foundation.Uri("ms-appx:///data/nounlist.txt");
    var url = new Windows.Foundation.Uri("ms-appx:///data/Nouns.txt");
    
    Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url).done(function (file) {
        Windows.Storage.FileIO.readLinesAsync(file).done(function (lines) {
            DataExample.nounList = lines;
        });
    });
};
