// =========================================================
// Constants, Variables and Declarations
// =========================================================

let page = document.getElementById("page");
let mainButton;
let tools;
let expanding = false;
let cloudBase = "https://jsonblob.com/api/jsonBlob/"
let defaultContent = `- Open menu via ^ button
- Add note via + in menu
- Delete note via x button
- ^ flashes when saving
- Autosaves every 30s
- Manually save via menu
- Control + S to save
- Control + D to download`
var defaultNotes = {
    1: {
        title: "Welcome to StickyNotes",
        created: '2024-02-08T14:45:30.123Z',
        modified: '2024-02-08T14:45:30.123Z',
        content: defaultContent
    },
};
let beenWarned = false;
var notes = JSON.parse(JSON.stringify(defaultNotes));
const LOCALSTORAGE_ATTRIBUTE = 'savedNotes-2025-02-10';
let activeNoteContainer;
let lastFocusedElement;

// =========================================================
// Functionality
// =========================================================

// Simple replacement for alert / console.log
function mobileAlert(text) {
    let postit = document.querySelectorAll(".note-content")[0];
    postit.value += '\n\n' + text;
}

/**
 * Creates and appends a div element to a parent
 * @param options - Object with optional className, textContent, id, and title
 * @param parent - Optional parent element to append to
 * @param onClick - Optional event listener for the 'click' event
 * @returns {HTMLElement} The created div element
 */
function createDiv(options = { className: "", textContent: "", id: "", title: "" }, parent = null, onClick = null) {
    let element = document.createElement("div");
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.id) element.id = options.id;
    if (options.title) element.title = options.title;
    if (onClick) element.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });
    if (parent) parent.appendChild(element);
    return element;
}

/**
 * Creates and appends a textarea element to a parent
 * @param options - Object with optional className, textContent, id, and title
 * @param parent - Optional parent element to append to
 * @param onClick - Optional event listener for the 'click' event
 * @returns {HTMLTextAreaElement} The created textarea element
 */
function createTextArea(options = { className: "", textContent: "", id: "", title: "" }, parent = null, onClick = null) {
    let element = document.createElement("textarea");
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.id) element.id = options.id;
    if (options.title) element.title = options.title;
    if (onClick) element.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });
    if (parent) parent.appendChild(element);
    return element;
}

/**
 * Creates and appends a text element to a parent
 * @param options - Object with optional className, textContent, id, and title
 * @param parent - Optional parent element to append to
 * @param onClick - Optional event listener for the 'click' event
 * @returns {HTMLTextAreaElement} The created textarea element
 */
function createText(options = { className: "", textContent: "", id: "", title: "" }, parent = null, onClick = null) {
    let element = document.createElement("text");
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.id) element.id = options.id;
    if (options.title) element.title = options.title;
    if (onClick) element.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });
    if (parent) parent.appendChild(element);
    return element;
}

/**
 * Generates a new note ID greater than the current maximum ID
 * @returns {number} New note ID
 */
function getNewNoteID() {
    let ids = Object.keys(notes).map(id => parseInt(id));
    let maxID = Math.max(...ids);
    let newID = maxID + 1
    console.log(`New ID generated ${newID}`)
    return newID;
}

/**
 * Generates the current date and time in ISO format 
 * @returns {string} The current date YYYY-MM-DDTHH:mm:ss.sssZ
 */
function getDateString() {
    const date = new Date();
    const string = date.toISOString();
    return string;
}

/**
 * Creates a new blank note and adds it to the notes object
 * @returns {HTMLElement} The created note element
 */
function createBlankNote() {
    let date = getDateString();
    let id = getNewNoteID();
    let noteData = {
        title: '',
        content: '',
        created: date,
        modified: date
    };
    notes[id] = noteData;
    let output = createNote(noteData, id);
    return output
}

/**
 * Removes a note from the notes object and the DOM by its ID
 * @param noteId - The ID of the note to remove
 */
function removeNoteById(noteId) {
    delete notes[noteId];
    const noteElement = document.querySelector(`[data-id='${noteId}']`);
    noteElement.parentNode.remove();
}

/**
 * Removes a note from the notes object and the DOM by its element
 * @param note - The note element to remove
 */
function removeNoteByElement(note) {
    delete notes[note.dataset.id];
    note.style.transition = "background 0.2s";
    note.style.background = "rgba(0, 0, 0, 0.2)";
    setTimeout(() => note.parentNode.remove(), 400);
}

/**
 * Displays the current notes object in an alert
 */
function showNotes() {
    alert(JSON.stringify(notes, null, 2));
}

/**
 * Creates a note element from the given data and ID
 * @param data - The note data including title, content, and timestamps
 * @param id - The unique ID of the note
 * @returns {HTMLElement} The created note element
 */
function createNote(data, id) {
    let container = createDiv({ className: "note-container" }, page)
    let note = createDiv({ className: "note" }, container);
    let title = createDiv({ className: "note-title", textContent: data.title }, note);
    title.spellcheck = false;
    let content = createTextArea({ className: "note-content" }, note);

    title.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            content.focus();
        }
    })
    content.spellcheck = false;
    content.value = data.content;
    title.contentEditable = true;
    note.setAttribute('data-id', id);

    let button = createDiv({ className: "note-button" }, container, () => {
        removeNoteByElement(note);
        setInterval(saveAllNotes, 3000);
        VariablesToLocal();
    });
    createDiv({ className: "material-symbols-outlined small", textContent: 'close' }, button)

    return note
}

/**
 * Saves the current state of a note container
 * @param noteContainer - The container of the note to save
 * @param modifying - Whether the note is being modified (default true)
 */
function saveNoteContainer(noteContainer, modifying = true) {
    let noteElement = noteContainer.children[0];
    let id = noteElement.dataset.id;
    let title = noteElement.querySelector(".note-title").textContent;
    let content = noteElement.querySelector(".note-content").value;
    let noteData = notes[id];
    noteData.title = title;
    noteData.content = content;
    if (modifying) {
        let date = getDateString();
        noteData.modified = date;
        console.log(`Modified note ${id} at ${date}`);
    }
    console.log(`Saved note ${id}`);
}

// =========================================================
// Push and Pull Functionality
// =========================================================

/**
 * Saves all notes to variables
 */
function WindowToVariables() {
    let noteContainers = document.querySelectorAll(".note-container");
    let n = 0;
    for (const noteContainer of noteContainers) {
        saveNoteContainer(noteContainer, false);
        n++;
    }
    console.log("Window to variables");
}

/**
 * Saves notes from variables to localStorage
 */
function VariablesToLocal() {
    mainButton.style.transition = "color 0.5s";
    mainButton.style.color = "rgba(0, 255, 0, 0.8)";
    setTimeout(() => {
        mainButton.style.color = "";
    }, 500);
    localStorage.setItem(LOCALSTORAGE_ATTRIBUTE, JSON.stringify(notes));
    console.log("Variables to local");
}

/**
 * Saves notes from the window and variables to localStorage
 */
function WindowToLocal() {
    WindowToVariables();
    VariablesToLocal();
    console.log("∴ Window to local")
}

/**
 * Loads notes from localStorage into variables
 */
function LocalToVariables() {
    let saved = localStorage.getItem(LOCALSTORAGE_ATTRIBUTE);
    notes = JSON.parse(saved);
    console.log("Local to variables");
}

/**
 * Loads notes from variables into the window
 */
function VariablesToWindow() {
    const noteContainers = page.querySelectorAll('.note-container');
    noteContainers.forEach(note => note.remove());
    for (const [id, noteData] of Object.entries(notes)) {
        createNote(noteData, id);
    }
    console.log("Variables to window");
}

/**
 * Loads notes from localStorage to variables, then into the window
 */
function LocalToWindow() {
    LocalToVariables();
    VariablesToWindow();
    console.log("∴ Local to window")
}

/**
 * Fetches notes from the cloud and saves them to localStorage
 * @param url - The URL to fetch data from
 * @returns {Promise<boolean>} Whether the fetch was successful
 */
async function CloudToLocal(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Fetch failed with status: ${response.status}`);
            let id = url.split('/').at(-1);
            let message = `The one time link below is not valid:\n${url}\n\nIt may have been used before, try generating a new link`;
            alert(message);
            return false;
        }
        let data = await response.text();
        localStorage.setItem(LOCALSTORAGE_ATTRIBUTE, data);
        console.log("Cloud to local");
        return true;
    } catch (error) {
        console.error("Error fetching or saving data:", error);
        return false;
    }
}

/**
 * Loads notes from the cloud to the window
 * @param url - The URL to fetch data from
 * @returns {Promise<boolean>} Whether the operation was successful
 */
async function CloudToWindow(url) {
    let success = await CloudToLocal(url);
    if (success) {
        LocalToVariables();
        VariablesToWindow();
        console.log("∴ Cloud to window");
        return true
    }
    else {
        console.log("Error from CloudToLocal found in CloudToWindow");
    }

}

/**
 * Prompts the user to select a file to load notes from
 */
function DeviceToWindow() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                let result = reader.result;
                notes = JSON.parse(result);
                VariablesToWindow();
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

/**
 * Downloads the notes to the device as a JSON file
 */
function WindowToDevice() {
    WindowToVariables();
    VariablesToLocal();
    let name = getDateString() + '.json'
    let content = JSON.stringify(notes, null, 2)
    const blob = new Blob([content], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
}

// !========================================================
// ! Experimental
// !========================================================

/**
 * Saves the current state of the notes
 */
function saveAllNotes() {
    WindowToVariables();
    VariablesToLocal();
    let message = `Notes saved to local`;
    console.log(message);
}

/**
 * Copies the provided text to the clipboard
 * @param text - The text to copy
 * @returns {Promise<void>}
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error("Failed to copy:", err);
    }
};

/**
 * Resets all notes to the default state
 */
function resetAllNotes() {
    if (confirm('Reset is permanent, press cancel if this was a mistake')) {
        console.log('Pressed OK');
        notes = JSON.parse(JSON.stringify(defaultNotes));
        VariablesToLocal();
        VariablesToWindow();
    } else {
        console.log('Pressed Cancel');
    }
}

/**
 * Generates a one-time link for sharing notes
 * @returns {Promise<string>} The one-time link
 */
async function getOneTimeLink() {
    const response = await fetch(cloudBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notes),
    });
    if (response.status === 201) {
        const location = response.headers.get('Location');
        const userID = location.split('/').pop();
        const pathname = window.location.pathname;
        const origin = window.location.origin;
        let link = `${origin}${pathname}?otl=${userID}`
        return link;
    }
}

/**
 * Checks the URL for the presence of a one-time link
 * @returns {string|null} The one-time link if found
 */
function checkURLParameters() {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("otl");
    if (value && /^\d+$/.test(value)) {
        return value;
    }
}

/**
 * Destroys a cloud link by sending a DELETE request
 * @param url - The URL to delete
 * @returns {Promise<boolean>} Whether the deletion was successful
 */
async function destroyCloud(url) {
    const response = await fetch(url, { method: 'DELETE' });
    if (response.status === 200) {
        return true;
    }
}

// =========================================================
// Toolbar Class
// =========================================================

class ToolbarContainer {
    constructor() {
        this.element = document.getElementById('toolbar-container');
    }

    /**
     * Adds a new row to the toolbar
     */
    addRow() {
        createDiv({ className: "toolbar-row" }, this.element);
    }

    /**
     * Creates a button and adds it to a specified row
     * @param rowIndex - The index of the row to add the button to
     * @param iconCode - The icon code for the button
     * @param tooltipText - The tooltip text for the button
     * @param onClick - The function to execute on button click (optional)
     */
    createButton(rowIndex, iconCode, tooltipText, onClick = null) {
        let rows = this.element.children.length;
        if (rowIndex >= rows) {
            let needed = rowIndex - rows;
            for (let i = 0; i <= needed; i++) {
                this.addRow();
            }
        }
        const row = this.element.children[rowIndex];
        const button = createDiv({ className: "toolbar-button", title: tooltipText }, row, onClick)
        createDiv({ className: "material-symbols-outlined", textContent: iconCode }, button)
        return button;
    }
}

// =========================================================
// Document Listeners
// =========================================================

// Single event listener for switching between notes
document.addEventListener('click', (e) => {
    let closestNoteContainer = e.target.closest('.note-container');

    if (!closestNoteContainer) {
        if (activeNoteContainer) {
            console.log("clearing active container");

            if (activeNoteContainer) {
                var buttonA = activeNoteContainer.querySelector('.note-button');
                if (buttonA) {
                    buttonA.classList.remove('hidden');
                }
            }

            if (expanding) {
                activeNoteContainer.classList.remove('expanded');
            }
        };
        activeNoteContainer = null;

    } else if (closestNoteContainer !== activeNoteContainer) {
        console.log("new container");

        var buttonC = closestNoteContainer.querySelector('.note-button');
        if (buttonC) {
            buttonC.classList.add('hidden');
        }

        if (activeNoteContainer) {
            var buttonA = activeNoteContainer.querySelector('.note-button');
            if (buttonA) {
                buttonA.classList.remove('hidden');
            }
        }

        if (expanding) {
            if (activeNoteContainer) {
                activeNoteContainer.classList.remove('expanded');
            }
            closestNoteContainer.classList.add('expanded');
        }
        activeNoteContainer = closestNoteContainer;

    }
});

// =========================================================
// Initialisation Functions
// =========================================================

/**
 * Populates the toolbar with necessary buttons and their functionality
 */
function populateToolbar() {
    tools = new ToolbarContainer();
    tools.createButton(0, "keyboard_arrow_up", null, null);
    tools.createButton(1, "add", "Add New Note", () => {
        createBlankNote();
        setInterval(saveAllNotes, 3000);
    });
    tools.createButton(2, "save", "Manual Save", () => saveAllNotes());
    tools.createButton(3, "more_vert", "More Tools", "", null);
    tools.createButton(3, "download", "Save to Device", () => WindowToDevice());
    tools.createButton(3, "folder", "Load from Device", () => {
        alert("Loading on Mobile is quirky\n- Select 'Photos and videos' on Android\n- Look for .json file in downloads folder")
        DeviceToWindow();
        WindowToLocal();
    });
    tools.createButton(3, "delete_history", "Reset All Notes", () => resetAllNotes());

    tools.createButton(3, "cloud_upload", "Share Notes", async () => {
        if (beenWarned) {
            let oneTimeLink = await getOneTimeLink();
            let copied = await copyToClipboard(oneTimeLink);
            if (copied) {
                alert(`One time link copied to clipboard:\n${oneTimeLink}`);
            }
            else {
                alert(`Clipboard access denied by device, copy or write down this link: ${oneTimeLink}`);
            }
        }
        if (!beenWarned) {
            let message = 'Cloud share generates a one time use link\n- Do not use this to share important or personal information\n- Opening the link  on another device will create a separate copy of all notes in this library on that device\n- Once the link is used, its data is deleted and it will no longer work\n\nThis message will only pop up once per session, pressing "Share Notes" will now work if you click it again';
            alert(message);
            beenWarned = true;
        }

    });

    tools.createButton(3, "open_in_full", "Toggle Expanding Notes", () => {
        expanding = !expanding;
        if (activeNoteContainer) {
            activeNoteContainer.classList.remove('expanded');
            var buttonA = activeNoteContainer.querySelector('.note-button');
            if (buttonA) {
                buttonA.classList.remove('hidden');
            }
            activeNoteContainer = null;
        }
    });
}

/**
 * Main initialisation function to set up the application
 */
async function main() {

    populateToolbar();

    mainButton = document.getElementById("toolbar-container").firstElementChild.firstElementChild.firstElementChild;

    let oneTimeLink = checkURLParameters();
    if (oneTimeLink) {
        let message = 'Cloud load removes current notes, press Cancel if this was a mistake';

        if (confirm(message)) {
            console.log('Pressed OK');
            let url = `${cloudBase}${oneTimeLink}`;
            console.log(url);
            let success = await CloudToWindow(url);
            if (success) {
                WindowToLocal();
                let destroyed = await destroyCloud(url);
                if (destroyed) {
                    console.log(`OTL ${url} destroyed`)
                }
                else {
                    console.log(`Error: OTL ${url} not destroyed`)
                }
            }
        } else {
            console.log('Pressed Cancel');
        }
        const pathname = window.location.pathname;
        const newURL = window.location.origin + pathname;
        window.history.replaceState(null, '', newURL);
    }


    if (localStorage.getItem(LOCALSTORAGE_ATTRIBUTE) !== null) {
        LocalToWindow();
    }
    else {
        VariablesToWindow();
    }

    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveAllNotes();
        }
        else if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            saveAllNotes();
            WindowToDevice();
        }
    })

    mainButton.addEventListener('click', () => {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    })

    tools.element.addEventListener('click', () => {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    })

    setInterval(saveAllNotes, 30000);

};

// =========================================================
// Execution
// =========================================================

main();