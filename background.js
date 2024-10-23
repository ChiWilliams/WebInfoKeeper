async function logKeyValuePair(keyValue) {
    let dict = await browser.storage.local.get('dictionary');
    if (!dict.dictionary) {
        dict = {dictionary: {}};
    }
    dict.dictionary[keyValue.key] = keyValue.value;
    console.log(`In logKeyValuePair, dictionary is ${JSON.stringify(dict.dictionary)}`);
    await browser.storage.local.set(dict);
}

async function getValueFomKey(key) {
    dict = (await browser.storage.local.get('dictionary')).dictionary
    console.log(`In getValueFromKey, with dictionary valu\n ${JSON.stringify(dict)}`);

    console.log(JSON.stringify(dict[key]));
    return dict[key] ?? "no such key";
}


browser.commands.onCommand.addListener(async (command) => {
    if (command === "store-content") {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

        // check if the content script is injected:
        try {
            await browser.tabs.sendMessage(tab.id, { command: "ping"});
        } catch (err) {
            // if fails, then thing doesn't exist
            // so we inject it
            await browser.tabs.executeScript( 
                { "file": "/content-script/read-and-write.js" });
        }

        let response = await browser.tabs.sendMessage(tab.id,
            {command: "copyAction"});

        // check if response is not null, and log it
        if (response) {
            logKeyValuePair(response);
        }
    }

    if (command === "get-content") {
        console.log("TODO: implement get-content");

        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

        // check if the content script is injected:
        try {
            await browser.tabs.sendMessage(tab.id, { command: "ping"});
        } catch (err) {
            // if fails, then thing doesn't exist
            // so we inject it
            await browser.tabs.executeScript( 
                { "file": "/content-script/read-and-write.js" });
        }

        let key = await browser.tabs.sendMessage(tab.id,
            {command: "getKeyForRetrieval"}
        );
        const pasteValue = await getValueFomKey(key);


        console.log("about to send value!")
        await browser.tabs.sendMessage(tab.id, { command: "addValueToClipboard", value: pasteValue})
    }

    if (command == "print-dictionary") {
        dict = await browser.storage.local.get('dictionary')
        console.log("in print-dictionary")
        dictText = JSON.stringify(dict)
        console.log(`Dict is: \n ${dictText}`)
    }
  });