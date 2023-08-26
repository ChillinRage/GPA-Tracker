const FAIL = ["D+", "D", "F"];

/* true: x bigger than y
 * false: x equal to or less than y 
 */
function compareGrade(row1, row2) {
    let x = row1[3];
    let y = row2[3];

    if (!raw && (row1[6] || row2[6])) { // S and U is flushed to bottom
        if (row1[6] && row2[6]) { // both SU
            return FAIL.includes(row1[3])
                ? 1
                : -1;
        } 

        return row1[6]
            ? 1
            : -1;
    }

    if (x[0] != y[0] || x === y) { // different letter grade or exactly equal
        return x[0] < y[0]
            ? -1
            : 1;
    }
    return x[1] === "+" || y[1] === "-"
        ? -1
        : 1;
}

// Sort by lexicographical order
function compareCode(row1, row2) {
    let x = row1[2];
    let y = row2[2];

    return x > y
        ? 1
        : -1;
}

// sort by year and sem
const DEFAULT = (row1, row2) => {
    return row1[0] < row2[0] // lower year on top
           ? -1
           : row1[0] > row2[0]
             ? 1
             : row1[1] < row2[1] // lower sem on top
               ? -1
               : row1[1] > row2[1]
                 ? 1
                 : compareCode(row1, row2); // equal year and sem
};

/* ======================== Checkers =============================== */

function is_number(word) {
    var regex = /^[0-9]+$/;
    if (isempty(word)) {
        return false;
    } else if (!word.match(regex)) {
        alert('"' + word + '" (in MC/Unit field) is not a valid number.');
        return false;
    } else {
        return true;
    }
}

function is_module(word) {
    if (isempty(word)) {
        return false;
    } else {
        const valid = (word === word.toUpperCase());
        if (!valid) {
            alert('Ensure the module code is in capital letters.');
        }

        return valid
    }
}

function isempty(word) {
    if (word === '') {
        alert('Error. There is an empty field.');
    }

    return word === '';
}
/* ------------------------------------------------------------------- */

function handleEvent(event) {
    if (event.key == "Enter") {
        const form = document.getElementById("add_block");
        const index = [...form].indexOf(event.target);
        form.elements[index + 1].focus();
    }
}

function clear_table() {
    const table = document.getElementById('table');
    const rowLength = table.rows.length - 1; // -1 for header row

    for (let i = 0; i < rowLength; i++) {
        table.deleteRow(1);
    }
}

function reset_form() {
    document.getElementById('year').value = 1;
    document.getElementById('semester').value = 1;
    document.getElementById('module').value = '';
    document.getElementById('grade').value = "A+";
    document.getElementById('mc').value = '';
    document.getElementById('type').value = '';
    document.getElementById('SU').value = 'no';
}

function get_data() {
    const storage = window.localStorage,
          len = storage.length,
          data = [],
          keys = Object.keys(storage);

    for (let i = 0; i < len; i++) {
        var temp = storage.getItem(keys[i]);
        data.push(JSON.parse(temp));
    }

    return data;
}

function insert_row(data) {
    const table = document.getElementById("table");
    const row = table.insertRow();
    const year = row.insertCell(0);
    const sem = row.insertCell(1);
    const mod = row.insertCell(2);
    const grade = row.insertCell(3);
    const mc = row.insertCell(4);
    const remark = row.insertCell(5);

    year.innerHTML = data[0];
    sem.innerHTML = data[1];
    mod.innerHTML = data[2];
    grade.innerHTML = data[3];
    mc.innerHTML = parseInt(data[4]);
    remark.innerHTML = data[5];

    if (!raw && data[6]) { // Change grade to S/U if yes
        if (FAIL.includes(data[3])) {grade.innerHTML = "U";}
        else {grade.innerHTML = "S";}
    }
}

function add_row() {
    const year = document.getElementById('year').value;
    const sem = document.getElementById('semester').value;
    const mod = document.querySelector('#module').value.trim();
    var   grade = document.querySelector('#grade').value;
    const mc = document.querySelector('#mc').value.trim();
    const type = document.querySelector('#type').value.trim();
    const SU = (document.querySelector('#SU').value === 'yes'); // true if SU

    if (is_module(mod) && is_number(mc) && !isempty(type)) {
        const arr = [year, sem, mod, grade, mc, type, SU];
        if (!add_to_storage(arr)) {
            return;
        }

        display();
        reset_form();
        update_cap();
    }
}

function add_to_storage(details) {
    const storage = window.localStorage;
    if (storage.getItem(details[2]) !== null) {
        alert("Course already exist. Remove existing one before adding it.");
        return false;
    }

    storage.setItem(details[2], JSON.stringify(details));
    return true;
}

function delete_row() {
    const mod = prompt('Enter Module code to delete').trim();
    if (mod === '') {
        alert('Invalid/Empty input');
    } else {
        const exist = delete_from_storage(mod); //delete and get row of module
        if (!exist) {
            alert(mod + ' is not found.');
        } else {
            alert(mod + ' has been removed.');
            display();
            update_cap();
        }
    }
}

function delete_from_storage(mod) {
    const storage = window.localStorage;
    if (storage.getItem(mod) !== null) {
        storage.removeItem(mod);
        return true;
    }

    return false;
}

function update_cap() {
    const data = get_data();
    let total_mc = 0;
    let points = 0;

    for (const row of data) {
        if (!raw && JSON.parse(row[6])) continue; //if SU, skip
        total_mc += JSON.parse(row[4]);
        switch (row[3]) {
            case 'A+':
                points += (5 * JSON.parse(row[4]));
                break;
            case 'A':
                points += (5 * JSON.parse(row[4]));
                break;
            case 'A-':
                points += (4.5 * JSON.parse(row[4]));
                break;
            case 'B+':
                points += (4 * JSON.parse(row[4]));
                break;
            case 'B':
                points += (3.5 * JSON.parse(row[4]));
                break;
            case 'B-':
                points += (3 * JSON.parse(row[4]));
                break;
            case 'C+':
                points += (2.5 * JSON.parse(row[4]));
                break;
            case 'C':
                points += (2 * JSON.parse(row[4]));
                break;
            case 'D+':
                points += (1.5 * JSON.parse(row[4]));
                break;
            case 'D':
                points += (1 * JSON.parse(row[4]));
                break;
            case 'F':
                points += (0 * JSON.parse(row[4]));
                break;
        }
    }

    if (total_mc > 0) {
        document.getElementById('cap_label').innerHTML = (points / total_mc).toFixed(2);
    }
}

function display() {
    const data = get_data();

    for (const row of data) {
        insert_row(row);
    }

    update_cap();
}

function displayRaw(sortFunc) {
    const data = get_data();
    raw = true;
    data.sort(sortFunc);

    // insert into html
    clear_table();
    for (let i = 0; i < data.length; i++) {
        insert_row(data[i]);
    }
    
    update_cap();
}

function displaySU(sortFunc) {
    const data = get_data();
    raw = false;
    data.sort(sortFunc);

    // insert into html
    clear_table();
    for (let i = 0; i < data.length; i++) {
        insert_row(data[i]);
    }

    update_cap();
}

function display(sortFunc) {
    if (raw) {
        displayRaw(sortFunc);
    } else {
        displaySU(sortFunc);
    }
}

function main() {
    window.add_row = add_row;
    window.delete_row = delete_row;
    displaySU(DEFAULT);
}

let raw;
main();
