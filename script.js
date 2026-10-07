/* =====================================================
   LIBRARY MANAGEMENT SYSTEM
   Fine = ₹10 per late day
===================================================== */


/* ================= DATA ================= */

let students =
    JSON.parse(localStorage.getItem("libraryStudents")) || [];

let books =
    JSON.parse(localStorage.getItem("libraryBooks")) || [];

let transactions =
    JSON.parse(localStorage.getItem("libraryTransactions")) || [];

let users =
    JSON.parse(localStorage.getItem("libraryUsers")) || [];


/* ================= DEFAULT ADMIN ================= */

if (users.length === 0) {

    users.push({
        name: "Admin",
        email: "admin@gmail.com",
        password: "admin123"
    });

    saveData();
}


/* ================= LOGIN ================= */

function login() {

    let email =
        document.getElementById("loginEmail").value.trim();

    let password =
        document.getElementById("loginPassword").value.trim();


    let user = users.find(
        u =>
            u.email === email &&
            u.password === password
    );


    if (!user) {

        showToast("Invalid email or password ❌");

        return;
    }


    localStorage.setItem(
        "libraryCurrentUser",
        JSON.stringify(user)
    );


    document
        .getElementById("authPage")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");


    initializeApp();

    showToast("Login successful ✅");
}


/* ================= SIGNUP ================= */

function signup() {

    let name =
        document.getElementById("signupName").value.trim();

    let email =
        document.getElementById("signupEmail").value.trim();

    let password =
        document.getElementById("signupPassword").value.trim();


    if (!name || !email || !password) {

        showToast("Please fill all fields");

        return;
    }


    let exists =
        users.some(u => u.email === email);


    if (exists) {

        showToast("Email already exists");

        return;
    }


    users.push({
        name,
        email,
        password
    });


    saveData();

    showToast("Account created successfully ✅");

    showLogin();
}


/* ================= SHOW LOGIN ================= */

function showLogin() {

    document
        .getElementById("loginBox")
        .classList.remove("hidden");

    document
        .getElementById("signupBox")
        .classList.add("hidden");
}


/* ================= SHOW SIGNUP ================= */

function showSignup() {

    document
        .getElementById("loginBox")
        .classList.add("hidden");

    document
        .getElementById("signupBox")
        .classList.remove("hidden");
}


/* ================= LOGOUT ================= */

function logout() {

    localStorage.removeItem("libraryCurrentUser");

    document
        .getElementById("app")
        .classList.add("hidden");

    document
        .getElementById("authPage")
        .classList.remove("hidden");

    showToast("Logged out successfully");
}


/* ================= SAVE DATA ================= */

function saveData() {

    localStorage.setItem(
        "libraryStudents",
        JSON.stringify(students)
    );

    localStorage.setItem(
        "libraryBooks",
        JSON.stringify(books)
    );

    localStorage.setItem(
        "libraryTransactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "libraryUsers",
        JSON.stringify(users)
    );
}


/* ================= PAGE NAVIGATION ================= */

function showPage(pageId) {

    let pages =
        document.querySelectorAll(".page");


    pages.forEach(page => {

        page.classList.add("hidden");

    });


    document
        .getElementById(pageId)
        .classList.remove("hidden");


    if (pageId === "dashboard") {

        updateDashboard();

    }

    if (pageId === "students") {

        renderStudents();

    }

    if (pageId === "books") {

        renderBooks();

    }

    if (pageId === "issue") {

        prepareIssuePage();

    }

    if (pageId === "return") {

        renderIssuedBooks();

    }

    if (pageId === "history") {

        renderHistory();

    }
}


/* ================= ADD STUDENT ================= */

function addStudent() {

    let name =
        document.getElementById("studentName")
            .value.trim();

    let roll =
        document.getElementById("studentRoll")
            .value.trim();

    let section =
        document.getElementById("studentSection")
            .value.trim();


    if (!name || !roll || !section) {

        showToast("Please fill all student details");

        return;
    }


    let rollExists =
        students.some(
            student => student.roll === roll
        );


    if (rollExists) {

        showToast("Roll number already exists");

        return;
    }


    students.push({

        id: Date.now(),

        name: name,

        roll: roll,

        section: section

    });


    saveData();

    document.getElementById("studentName").value = "";
    document.getElementById("studentRoll").value = "";
    document.getElementById("studentSection").value = "";


    renderStudents();

    updateDashboard();

    showToast("Student added successfully ✅");
}


/* ================= RENDER STUDENTS ================= */

function renderStudents(list = students) {

    let table =
        document.getElementById("studentTable");


    table.innerHTML = "";


    if (list.length === 0) {

        table.innerHTML =
            `<tr>
                <td colspan="7">
                    No students found
                </td>
            </tr>`;

        return;
    }


    list.forEach(student => {

        let studentTransactions =
            transactions.filter(
                t =>
                    t.studentId === student.id
            );


        let issued =
            studentTransactions.filter(
                t => t.status === "Issued"
            ).length;


        let totalBooks =
            studentTransactions.length;


        let fine =
            studentTransactions.reduce(
                (sum, t) =>
                    sum + (t.fine || 0),
                0
            );


        table.innerHTML += `

            <tr>

                <td>${student.name}</td>

                <td>${student.roll}</td>

                <td>${student.section}</td>

                <td>${totalBooks}</td>

                <td>${issued}</td>

                <td class="fine">
                    ₹${fine}
                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="deleteStudent(${student.id})"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `;
    });
}


/* ================= SEARCH STUDENTS ================= */

function searchStudents() {

    let value =
        document.getElementById("studentSearch")
            .value
            .toLowerCase();


    let result =
        students.filter(student =>

            student.name
                .toLowerCase()
                .includes(value)

            ||

            student.roll
                .toLowerCase()
                .includes(value)

            ||

            student.section
                .toLowerCase()
                .includes(value)

        );


    renderStudents(result);
}


/* ================= DELETE STUDENT ================= */

function deleteStudent(id) {

    let hasIssued =
        transactions.some(
            t =>
                t.studentId === id &&
                t.status === "Issued"
        );


    if (hasIssued) {

        showToast(
            "Student has an issued book"
        );

        return;
    }


    if (!confirm("Delete this student?")) {

        return;
    }


    students =
        students.filter(
            student => student.id !== id
        );


    saveData();

    renderStudents();

    updateDashboard();

    showToast("Student deleted");
}


/* ================= ADD BOOK ================= */

function addBook() {

    let name =
        document.getElementById("bookName")
            .value.trim();

    let author =
        document.getElementById("bookAuthor")
            .value.trim();

    let category =
        document.getElementById("bookCategory")
            .value.trim();


    if (!name || !author || !category) {

        showToast("Please fill all book details");

        return;
    }


    books.push({

        id: Date.now(),

        name,

        author,

        category,

        available: true

    });


    saveData();

    document.getElementById("bookName").value = "";
    document.getElementById("bookAuthor").value = "";
    document.getElementById("bookCategory").value = "";


    renderBooks();

    updateDashboard();

    showToast("Book added successfully 📚");
}


/* ================= RENDER BOOKS ================= */

function renderBooks(list = books) {

    let table =
        document.getElementById("bookTable");


    table.innerHTML = "";


    if (list.length === 0) {

        table.innerHTML =
            `<tr>
                <td colspan="5">
                    No books found
                </td>
            </tr>`;

        return;
    }


    list.forEach(book => {

        table.innerHTML += `

            <tr>

                <td>${book.name}</td>

                <td>${book.author}</td>

                <td>${book.category}</td>

                <td>

                    ${
                        book.available

                        ?

                        `<span class="status-available">
                            Available
                        </span>`

                        :

                        `<span class="status-issued">
                            Issued
                        </span>`
                    }

                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="deleteBook(${book.id})"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `;
    });
}


/* ================= SEARCH BOOKS ================= */

function searchBooks() {

    let value =
        document.getElementById("bookSearch")
            .value
            .toLowerCase();


    let result =
        books.filter(book =>

            book.name
                .toLowerCase()
                .includes(value)

            ||

            book.author
                .toLowerCase()
                .includes(value)

            ||

            book.category
                .toLowerCase()
                .includes(value)

        );


    renderBooks(result);
}


/* ================= DELETE BOOK ================= */

function deleteBook(id) {

    let book =
        books.find(b => b.id === id);


    if (!book.available) {

        showToast(
            "This book is currently issued"
        );

        return;
    }


    if (!confirm("Delete this book?")) {

        return;
    }


    books =
        books.filter(
            b => b.id !== id
        );


    saveData();

    renderBooks();

    updateDashboard();

    showToast("Book deleted");
}


/* ================= ISSUE PAGE ================= */

function prepareIssuePage() {

    let studentSelect =
        document.getElementById("issueStudent");

    let bookSelect =
        document.getElementById("issueBook");


    studentSelect.innerHTML =
        `<option value="">
            Select Student
        </option>`;


    students.forEach(student => {

        studentSelect.innerHTML += `

            <option value="${student.id}">

                ${student.name}
                - ${student.roll}
                - Section ${student.section}

            </option>

        `;

    });


    bookSelect.innerHTML =
        `<option value="">
            Select Book
        </option>`;


    books
        .filter(book => book.available)
        .forEach(book => {

            bookSelect.innerHTML += `

                <option value="${book.id}">

                    ${book.name}
                    - ${book.author}

                </option>

            `;

        });


    let today =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById("issueDate").value =
        today;


    let due =
        new Date();

    due.setDate(
        due.getDate() + 7
    );


    document.getElementById("dueDate").value =
        due
            .toISOString()
            .split("T")[0];
}


/* ================= ISSUE BOOK ================= */

function issueBook() {

    let studentId =
        Number(
            document.getElementById("issueStudent")
                .value
        );


    let bookId =
        Number(
            document.getElementById("issueBook")
                .value
        );


    let issueDate =
        document.getElementById("issueDate")
            .value;


    let dueDate =
        document.getElementById("dueDate")
            .value;


    if (
        !studentId ||
        !bookId ||
        !issueDate ||
        !dueDate
    ) {

        showToast(
            "Please fill all details"
        );

        return;
    }


    if (dueDate < issueDate) {

        showToast(
            "Due date cannot be before issue date"
        );

        return;
    }


    let alreadyIssued =
        transactions.some(
            t =>
                t.studentId === studentId &&
                t.status === "Issued"
        );


    if (alreadyIssued) {

        showToast(
            "This student already has an issued book"
        );

        return;
    }


    let book =
        books.find(
            b => b.id === bookId
        );


    if (!book || !book.available) {

        showToast(
            "Book is not available"
        );

        return;
    }


    let transaction = {

        id: Date.now(),

        studentId,

        bookId,

        issueDate,

        dueDate,

        returnDate: null,

        fine: 0,

        status: "Issued"

    };


    transactions.push(transaction);


    book.available = false;


    saveData();


    prepareIssuePage();

    updateDashboard();

    showToast(
        "Book issued successfully 📖"
    );
}


/* ================= CALCULATE LATE DAYS ================= */

function calculateLateDays(dueDate, returnDate) {

    let due =
        new Date(dueDate);

    let returned =
        new Date(returnDate);


    let difference =
        returned - due;


    let days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    return Math.max(0, days);
}


/* ================= RETURN BOOKS ================= */

function renderIssuedBooks() {

    let table =
        document.getElementById("issuedTable");


    table.innerHTML = "";


    let issued =
        transactions.filter(
            t => t.status === "Issued"
        );


    if (issued.length === 0) {

        table.innerHTML =
            `<tr>
                <td colspan="8">
                    No issued books
                </td>
            </tr>`;

        return;
    }


    issued.forEach(transaction => {

        let student =
            students.find(
                s =>
                    s.id === transaction.studentId
            );


        let book =
            books.find(
                b =>
                    b.id === transaction.bookId
            );


        let today =
            new Date()
                .toISOString()
                .split("T")[0];


        let lateDays =
            calculateLateDays(
                transaction.dueDate,
                today
            );


        let fine =
            lateDays * 10;


        table.innerHTML += `

            <tr>

                <td>
                    ${student ? student.name : "Unknown"}
                </td>

                <td>
                    ${student ? student.roll : "-"}
                </td>

                <td>
                    ${book ? book.name : "Unknown"}
                </td>

                <td>
                    ${transaction.issueDate}
                </td>

                <td>
                    ${transaction.dueDate}
                </td>

                <td>
                    ${lateDays}
                </td>

                <td class="fine">
                    ₹${fine}
                </td>

                <td>

                    <button
                        class="return-btn"
                        onclick="returnBook(${transaction.id})"
                    >
                        Return
                    </button>

                </td>

            </tr>

        `;
    });
}


/* ================= RETURN BOOK ================= */

function returnBook(transactionId) {

    let transaction =
        transactions.find(
            t =>
                t.id === transactionId
        );


    if (!transaction) {

        return;
    }


    let returnDate =
        new Date()
            .toISOString()
            .split("T")[0];


    let lateDays =
        calculateLateDays(
            transaction.dueDate,
            returnDate
        );


    /*
        FINE FORMULA

        Late Days × ₹10
    */

    let fine =
        lateDays * 10;


    transaction.returnDate =
        returnDate;

    transaction.fine =
        fine;

    transaction.lateDays =
        lateDays;

    transaction.status =
        "Returned";


    let book =
        books.find(
            b =>
                b.id === transaction.bookId
        );


    if (book) {

        book.available = true;

    }


    saveData();


    renderIssuedBooks();

    updateDashboard();

    renderStudents();

    renderBooks();


    showToast(
        `Book returned. Fine = ₹${fine}`
    );
}


/* ================= HISTORY ================= */

function renderHistory() {

    let table =
        document.getElementById("historyTable");


    table.innerHTML = "";


    if (transactions.length === 0) {

        table.innerHTML =
            `<tr>
                <td colspan="8">
                    No transaction history
                </td>
            </tr>`;

        return;
    }


    [...transactions]
        .reverse()
        .forEach(transaction => {

            let student =
                students.find(
                    s =>
                        s.id ===
                        transaction.studentId
                );


            let book =
                books.find(
                    b =>
                        b.id ===
                        transaction.bookId
                );


            table.innerHTML += `

                <tr>

                    <td>
                        ${student ? student.name : "Unknown"}
                    </td>

                    <td>
                        ${student ? student.roll : "-"}
                    </td>

                    <td>
                        ${book ? book.name : "Unknown"}
                    </td>

                    <td>
                        ${transaction.issueDate}
                    </td>

                    <td>
                        ${transaction.dueDate}
                    </td>

                    <td>
                        ${transaction.returnDate || "-"}
                    </td>

                    <td class="fine">
                        ₹${transaction.fine || 0}
                    </td>

                    <td>

                        ${
                            transaction.status === "Issued"

                            ?

                            `<span class="status-issued">
                                Issued
                            </span>`

                            :

                            `<span class="status-available">
                                Returned
                            </span>`
                        }

                    </td>

                </tr>

            `;
        });
}


/* ================= DASHBOARD ================= */

function updateDashboard() {

    let totalStudents =
        students.length;


    let totalBooks =
        books.length;


    let issuedBooks =
        transactions.filter(
            t =>
                t.status === "Issued"
        ).length;


    let availableBooks =
        books.filter(
            b =>
                b.available
        ).length;


    let totalFine =
        transactions.reduce(
            (sum, t) => {

                if (t.status === "Returned") {

                    return sum + (t.fine || 0);

                }


                let lateDays =
                    calculateLateDays(
                        t.dueDate,
                        new Date()
                            .toISOString()
                            .split("T")[0]
                    );


                return sum +
                    lateDays * 10;

            },

            0
        );


    document.getElementById(
        "totalStudents"
    ).textContent =
        totalStudents;


    document.getElementById(
        "totalBooks"
    ).textContent =
        totalBooks;


    document.getElementById(
        "issuedBooks"
    ).textContent =
        issuedBooks;


    document.getElementById(
        "totalFine"
    ).textContent =
        totalFine;


    document.getElementById(
        "infoStudents"
    ).textContent =
        totalStudents;


    document.getElementById(
        "availableBooks"
    ).textContent =
        availableBooks;


    document.getElementById(
        "infoIssued"
    ).textContent =
        issuedBooks;
}


/* ================= TOAST ================= */

function showToast(message) {

    let toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.style.display =
        "block";


    setTimeout(() => {

        toast.style.display =
            "none";

    }, 2500);
}


/* ================= INITIALIZE ================= */

function initializeApp() {

    updateDashboard();

    renderStudents();

    renderBooks();

    renderIssuedBooks();

    renderHistory();

    showPage("dashboard");
}


/* ================= AUTO LOGIN ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        let currentUser =
            localStorage.getItem(
                "libraryCurrentUser"
            );


        if (currentUser) {

            document
                .getElementById("authPage")
                .classList.add("hidden");

            document
                .getElementById("app")
                .classList.remove("hidden");

            initializeApp();

        }

    }
);