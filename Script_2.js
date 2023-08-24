// SORTING FUNCTIONS
const DEFAULT = (x,y) => 0;
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
                ? -1
                : 1;
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

function compareCode(row1, row2) {
    let x = row1[2];
    let y = row2[2];

    return x > y
        ? 1
        : -1;
}

/* ================================================================ */

function handleEvent(event) {
    if (event.key == "Enter") {
        const form = document.getElementById("add_block");
        const index = [...form].indexOf(event.target);
        form.elements[index + 1].focus();
    }
}

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

function get_data() {
    const storage = window.localStorage;
    const len = storage.length + 1;  // 1-indexed
    const data = [];

    for (let i = 1; i < len; i++) {
        var temp = storage.getItem(i.toString());
        data.push(JSON.parse(temp));
    }

    return data;
}

function clear_table() {
    const table = document.getElementById('table');
    const rowLength = table.rows.length - 1;

    for (let i = 0; i < rowLength; i++) {
        table.deleteRow(1);
    }
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
        insert_row(arr);
        add_to_storage(arr);

        document.getElementById('year').value = 1;
        document.getElementById('semester').value = 1;
        document.getElementById('module').value = '';
        document.getElementById('grade').value = "A+";
        document.getElementById('mc').value = '';
        document.getElementById('type').value = '';
        document.getElementById('SU').value = 'no';

        update_cap();
    }
}

function add_to_storage(details) {
    try{
    alert(window.localStorage.getItem(1));
    const key = window.localStorage.length + 1;
    window.localStorage.setItem(key, JSON.stringify(details));
    alert("added success");
    } catch(err) {alert("error");}
}

function delete_row() {
    const mod = prompt('Enter Module code to delete').trim();
    if (mod === '') {
        alert('Invalid/Empty input');
    } else {
        const index = delete_from_storage(mod); //delete and get row of module
        if (index === -1) {
            alert(mod + ' is not found.');
        } else {
            var table = document.getElementById("table");
            table.deleteRow(index + 1);
            alert(mod + ' has been removed.');
            update_cap();
        }
    }
}

function delete_from_storage(mod) {
    const storage = window.localStorage;
    for (let i = 1; i < storage.length + 1; i++) {
        var temp = JSON.parse(storage.getItem(i));
        if (temp[2] === mod) {
            storage.removeItem(i);
            console.log(temp);
            return i - 1;
        }
    }
    return -1;
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
