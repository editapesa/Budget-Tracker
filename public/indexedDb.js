const request = indexedDB.open('BudgetDB', 1);
let db;

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore('pending', { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(evt) {
    console.log(`Oh no! ${evt.target.errorCode}`);
}

function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');

    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then((res) => {
                if (res.length !== 0) {
                    transaction = db.transaction(['pending'], 'readwrite');
                    const currentStore = transaction.objectStore('pending');
                    currentStore.clear();
                }
            });
        }
    };
}

window.addEventListener('online', checkDatabase);
