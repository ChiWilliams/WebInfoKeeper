let SETTINGS = {};

document.addEventListener('DOMContentLoaded', async () => {
    SETTINGS = await loadSettings(); 
    const closeOnSet = SETTINGS.closeOnSet.toString();
    const closeonGet = SETTINGS.closeOnGet.toString();
    document.querySelector(`input[name="set-close"][value="${closeOnSet}"]`).checked = true;
    document.querySelector(`input[name="get-close"][value="${closeonGet}"]`).checked = true;
});


async function loadSettings() {
    let { settings } = await browser.storage.local.get('settings');
    if (!settings || Object.keys(settings).length === 0) {
        settings = {
            closeOnSet: true,
            closeOnGet: true
        }
        await browser.storage.local.set({ settings : settings });
    }
    return settings;
}

// const closeOnSetInput = document.

document.addEventListener('click', async (e) => {
    if (e.target.matches('#settings-save')){
        let settings = {
            closeOnSet: (document.querySelector('input[name="set-close"]:checked').value ?? true) === "true",
            closeOnGet: (document.querySelector('input[name="get-close"]:checked').value ?? true) === "true",        }
        try {
        await browser.storage.local.set( { settings: settings });
        } catch (error) {
            console.error(error)
        }
        // console.log("saved!")
    }
});