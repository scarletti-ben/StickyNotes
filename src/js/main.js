// =========================================================
// Constants, Variables and Declarations
// =========================================================

let page = document.getElementById("page");
let cloudURL = "https://jsonblob.com/api/jsonBlob/1338142578419359744";
var notes = {
    1: {
        title: "test1",
        created: '2024-02-08T14:45:30.123Z',
        modified: '2024-02-08T14:45:30.123Z',
        content: 'text1'
    },
    2: {
        title: "test2",
        created: '2025-02-08T14:45:30.123Z',
        modified: '2025-02-08T14:45:30.123Z',
        content: 'text2'
    }
};

// =========================================================
// Functionality
// =========================================================

// Utility function for quick creation of a div element
function createDiv(options = { className: "", textContent: "", id: "", title: "" }, parent = null, onClick = null) {
    let element = document.createElement("div");
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.id) element.id = options.id;
    if (options.title) element.title = options.title;
    if (onClick) element.addEventListener('click', onClick);
    if (parent) parent.appendChild(element);
    return element;
}

// Utility function for quick creation of a pre element
function createPre(options = { className: "", textContent: "", id: "", title: "" }, parent = null, onClick = null) {
    let element = document.createElement("pre");
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.id) element.id = options.id;
    if (options.title) element.title = options.title;
    if (onClick) element.addEventListener('click', onClick);
    if (parent) parent.appendChild(element);
    return element;
}

// Get an ID greater than current maximum ID
function getNewNoteID() {
    let ids = Object.keys(notes).map(id => parseInt(id));
    let maxID = Math.max(...ids);
    let newID = maxID + 1
    return newID;
}

// Get ECMA date time string YYYY-MM-DDTHH:mm:ss.sssZ
function getDateString() {
    const date = new Date();
    const string = date.toISOString();
    return string;
}

// Create a blank note with new ID and add to global notes
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

// Remove a note by its ID
function removeNoteById(noteId) {
    delete notes[noteId];
    const noteElement = document.querySelector(`[data-id='${noteId}']`);
    noteElement.parentNode.remove();
}

// Remove a note by its element
function removeNoteByElement(note) {
    delete notes[note.dataset.id];
    let container = note.parentNode;

    note.style.transition = "background 0.1s";
    note.style.background = "rgba(0, 0, 0, 0.2)";
    setTimeout(() => {
        setTimeout(() => container.remove(), 100);
    }, 100);


    // note.parentNode.remove();
}

// Show current notes as a stringified alert
function showNotes() {
    alert(JSON.stringify(notes, null, 2));
}

// Create note from data and id
function createNote(data, id) {
    let container = createDiv({ className: "note-container" }, page)
    let note = createDiv({ className: "note" }, container);
    let title = createDiv({ className: "note-title", textContent: data.title }, note);
    let content = createDiv({ className: "note-content", textContent: data.content }, note);
    title.contentEditable = true;
    content.contentEditable = true;
    note.setAttribute('data-id', id);
    title.addEventListener("focusout", () => {
        saveNoteContainer(container);
    });
    content.addEventListener("focusout", () => {
        saveNoteContainer(container);
    });

    let button = createDiv({ className: "note-button" }, container, () => removeNoteByElement(note));
    createDiv({ className: "material-symbols-outlined small", textContent: 'more_horiz' }, button)

    return note
}

// Save a note element, keep date created the same
function saveNoteContainer(noteContainer, modifying = true) {
    let noteElement = noteContainer.children[0];
    let id = noteElement.dataset.id;
    let title = noteElement.querySelector(".note-title").textContent;
    let content = noteElement.querySelector(".note-content").textContent;
    let noteData = notes[id];
    noteData.title = title;
    noteData.content = content;
    if (modifying) {
        let date = getDateString();
        noteData.modified = date;
        console.log(`Modified note ${id} at ${date}`);
    }
    console.log(`Saved note ${id}`);
    SessionToLocal();
}

function viewCloud() {
    window.open(cloudURL, '_blank');
}

// =========================================================
// Push and Pull Functionality
// =========================================================

function WindowToSession() {
    let noteContainers = document.querySelectorAll(".note-container");
    let n = 0;
    for (const noteContainer of noteContainers) {
        saveNoteContainer(noteContainer, false);
        n++;
    }
    console.log("Window to session");
}

function SessionToLocal() {
    localStorage.setItem('savedNotes', JSON.stringify(notes));
    console.log("Session to local");
}

function WindowToLocal() {
    WindowToSession();
    SessionToLocal();
    console.log("∴ Window to local")
}

function LocalToSession() {
    let saved = localStorage.getItem('savedNotes');
    notes = JSON.parse(saved);
    console.log("Local to session");
}

function SessionToWindow() {
    const noteContainers = page.querySelectorAll('.note-container');
    noteContainers.forEach(note => note.remove());
    for (const [id, noteData] of Object.entries(notes)) {
        createNote(noteData, id);
    }
    console.log("Session to window");
}

function LocalToWindow() {
    LocalToSession();
    SessionToWindow();
    console.log("∴ Local to window")
}

async function LocalToCloud() {
    let json = localStorage.getItem('savedNotes');
    const response = await fetch(cloudURL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: json
    });
    if (response.ok) {
        console.log(`Local to cloud`)
    }
}

async function WindowToCloud() {
    WindowToSession();
    SessionToLocal();
    await LocalToCloud();
    console.log("∴ Window to cloud")
}

async function CloudToLocal() {
    const response = await fetch(cloudURL);
    if (response.ok) {
        let data = await response.text();
        localStorage.setItem('savedNotes', data);
        console.log("Cloud to local");
    }
}

async function CloudToWindow() {
    await CloudToLocal();
    LocalToSession();
    SessionToWindow();
    console.log("∴ Cloud to window")
}

function pullDeviceToWindow() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                let result = reader.result;
                notes = JSON.parse(result);
                SessionToWindow();
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function WindowToDevice() {
    WindowToSession();
    SessionToLocal();
    let name = getDateString() + '.json'
    let content = JSON.stringify(notes, null, 2)
    const blob = new Blob([content], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
}

// =========================================================
// Toolbar Class
// =========================================================

class ToolbarContainer {
    constructor() {
        this.element = document.getElementById('toolbar-container');
    }

    // Add row to the toolbar
    addRow() {
        createDiv({ className: "toolbar-row" }, this.element);
    }

    // Create and add a button to a given row index
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
    }
}

// =========================================================
// Initialisation Functions
// =========================================================

// Create the ToolBar container and populate with buttons / functionality
function populateToolbar() {
    let tools = new ToolbarContainer();
    tools.createButton(0, "keyboard_arrow_up", "Add New Note", null);
    tools.createButton(1, "add", "Add New Note", () => createBlankNote());

    // tools.createButton(0, "link", "Show Notes JSON", () => showNotes());
    tools.createButton(2, "cloud_upload", "Save to Cloud", () => WindowToCloud());
    tools.createButton(2, "cloud_download", "Load from Cloud", () => CloudToWindow());
    tools.createButton(2, "save", "Save to Device", () => WindowToDevice());
    tools.createButton(2, "folder", "Load from Device", () => pullDeviceToWindow());
    tools.createButton(2, "link", "View Cloud", () => viewCloud());

    tools.createButton(3, "lock_person", "Debug Tools", () => alert("debug"));
    tools.createButton(3, "transition_push", "Window to Session", () => WindowToSession());
    tools.createButton(3, "hard_drive", "Session to Local", () => SessionToLocal());
    tools.createButton(3, "system_update_alt", "Local to Session", () => LocalToSession());
    tools.createButton(3, "system_update", "Session to Window", () => SessionToWindow());
    tools.createButton(3, "save", "Window to Local", () => WindowToLocal());
    tools.createButton(3, "folder", "Local to Window", () => LocalToWindow());
    tools.createButton(3, "cloud_upload", "Local to Cloud", () => LocalToCloud());
    tools.createButton(3, "cloud_download", "Cloud to Local", () => CloudToLocal());





    // tools.createButton(4, "folder", "A1");
    // tools.createButton(4, "save", "A1");
    // tools.createButton(4, "remove", "A1");
    // tools.createButton(4, "delete", "A1");
    // tools.createButton(4, "close", "A1");
    // tools.createButton(4, "sort_by_alpha", "A1");
    // tools.createButton(4, "edit", "A1");
    // tools.createButton(4, "sort", "A1");
    // tools.createButton(4, "logout", "A1");
    // tools.createButton(4, "check", "A1");
}

// Initialisation function
function main() {
    populateToolbar();
    CloudToWindow();

    async function save() {
        await WindowToCloud();
        let message = `Notes saved to cloud`;
        alert(message);
    }

    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            save();
        }
    })


};

// =========================================================
// Execution
// =========================================================

main();