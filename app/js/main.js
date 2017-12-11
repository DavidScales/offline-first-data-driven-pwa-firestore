/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const container = document.getElementById('container');
const offlineMessage = document.getElementById('offline');
const noDataMessage = document.getElementById('no-data');
const dataSavedMessage = document.getElementById('data-saved');
const saveErrorMessage = document.getElementById('save-error');
const addEventButton = document.getElementById('add-event-button');

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyAA5iOiomn9KXiwhF7UjbFC1G1-7zZ1SKU',
  authDomain: 'offline-data-driven-pwa.firebaseapp.com',
  databaseURL: 'https://offline-data-driven-pwa.firebaseio.com',
  projectId: 'offline-data-driven-pwa',
  storageBucket: 'offline-data-driven-pwa.appspot.com',
  messagingSenderId: '487233617533'
};
firebase.initializeApp(config);

firebase.firestore().enablePersistence()
  .then(() => {
    // Initialize Cloud Firestore through firebase
    const db = firebase.firestore();

    db.collection('events').onSnapshot({includeQueryMetadataChanges: true}, snapshot => {
      snapshot.docChanges.forEach(change => {
        // if (change.type === 'added') {
        //   console.log('New city: ', change.doc.data());
        // }
        const source = snapshot.metadata.fromCache ? 'local cache' : 'server';
        console.log('Data came from ' + source);
        console.log(change.doc.data());
      });

      console.log('snapshot!');
      console.log('outer, from cache:', snapshot.metadata.fromCache);

      // Dont do this, just update individual changes
      // snapshot.forEach(doc => {
      //   console.log(doc);
      // });
    });
  })
  .catch(err => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a a time.
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence
    }
  });

// Add initial data - need to fix, adds each time


// const sampleEvents = [
//   {
//     'title': 'MatLang',
//     'date': '7/4/2017',
//     'city': 'Tumxuk',
//     'note': 'quam pharetra magna ac consequat metus sapien ut nunc vestibulum ante ipsum primis in faucibus orci luctus'
//   },
//   {
//     'title': 'Lotstring',
//     'date': '10/15/2016',
//     'city': 'Malumfashi',
//     'note': 'non sodales sed tincidunt eu felis fusce posuere felis sed lacus morbi sem mauris laoreet ut'
//   },
//   {
//     'title': 'Cardify',
//     'date': '4/26/2017',
//     'city': 'Ndungu',
//     'note': 'ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae'
//   },
//   {
//     'title': 'Dlexr',
//     'date': '11/6/2016',
//     'city': 'Pimenta Bueno',
//     'note': 'orci luctus et ultrices posuere cubilia curae duis faucibus accumsan odio'
//   },
//   {
//     'title': 'Veribet',
//     'date': '3/23/2017',
//     'city': 'Asemanis',
//     'note': 'ut mauris eget massa tempor convallis nulla neque libero convallis eget eleifend luctus ultricies eu nibh quisque id'
//   },
//   {
//     'title': 'Y-find',
//     'date': '12/14/2016',
//     'city': 'Montalvão',
//     'note': 'sapien arcu sed augue aliquam erat volutpat in congue etiam justo etiam pretium iaculis'
//   },
//   {
//     'title': 'Alpha',
//     'date': '11/10/2016',
//     'city': 'Otok',
//     'note': 'suspendisse ornare consequat lectus in est risus auctor sed tristique in tempus sit'
//   },
//   {
//     'title': 'Daltfresh',
//     'date': '9/3/2016',
//     'city': 'Karlstad',
//     'note': 'ipsum dolor sit amet consectetuer adipiscing elit proin risus praesent lectus vestibulum quam sapien varius ut'
//   },
//   {
//     'title': 'Wrapsafe',
//     'date': '7/24/2017',
//     'city': 'Bålsta',
//     'note': 'vel enim sit amet nunc viverra dapibus nulla suscipit ligula in lacus curabitur at ipsum ac tellus semper'
//   },
//   {
//     'title': 'Andalax',
//     'date': '6/24/2017',
//     'city': 'Limbi',
//     'note': 'quam suspendisse potenti nullam porttitor lacus at turpis donec posuere metus vitae ipsum aliquam non mauris morbi'
//   }
// ];

// Promise.all(sampleEvents.map(sampleEvent => {
//   db.collection('events').add(sampleEvent);
// })).then(function() {
//   console.log('Documents written');
// }).catch(function(error) {
//   console.error('Error adding document: ', error);
// });

// db.collection('events').get().then(querySnapshot => {
//   querySnapshot.forEach(doc => {
//     console.log(`${doc.id} => ${doc.data()}`);
//   });
// });

// addEventButton.addEventListener('click', addAndPostEvent);

// Notification.requestPermission();

// const dbPromise = createIndexedDB();

loadFirebaseData();

function loadFirebaseData() {

}

// loadContentNetworkFirst();

function loadContentNetworkFirst() {
  getServerData() // get server data
  .then(dataFromNetwork => {
    updateUI(dataFromNetwork); // display server data on page
    saveEventDataLocally(dataFromNetwork) // update local copy of data in IDB
    .then(() => {
      setLastUpdated(new Date()); // mark when the local data was last updated
      messageDataSaved(); // alert user that data has been saved locally
    }).catch(err => {
      messageSaveError(); // alert user that there was an error saving data
      console.warn(err);
    });
  }).catch(err => { // if we can't connect to the server...
    console.log('Network requests have failed, this is expected if offline');
    getLocalEventData() // attempt to get local data from IDB
    .then(offlineData => {
      if (!offlineData.length) { // alert user if there is no local data
        messageNoData(); // alert user that no local data is available
      } else {
        messageOffline(); // alert user that we are using local data (possibly outdated)
        updateUI(offlineData); // display local data on page
      }
    });
  });
}

// window.addEventListener('online', () => {
//   container.innerHTML = '';
//   loadContentNetworkFirst();
// });

/* Network functions */

function getServerData() {
  return fetch('api/getAll').then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  });
}

function addAndPostEvent(e) {
  e.preventDefault();
  const data = {
    id: Date.now(),
    title: document.getElementById('title').value,
    date: document.getElementById('date').value,
    city: document.getElementById('city').value,
    note: document.getElementById('note').value
  };
  updateUI([data]);
  saveEventDataLocally([data]);
  const headers = new Headers({'Content-Type': 'application/json'});
  const body = JSON.stringify(data);
  return fetch('api/add', {
    method: 'POST',
    headers: headers,
    body: body
  });
}

/* UI functions */

function updateUI(events) {
  container.innerHTML = '';
  events.forEach(event => {
    const item =
      `<li class="card">
         <div class="card-text">
           <h2>${event.title}</h2>
           <h4>${event.date}</h4>
           <h4>${event.city}</h4>
           <p>${event.note}</p>
         </div>
       </li>`;
    container.insertAdjacentHTML('beforeend', item);
  });
}

function messageOffline() {
  // alert user that data may not be current
  const lastUpdated = getLastUpdated();
  if (lastUpdated) {
    offlineMessage.textContent += ' Last fetched server data: ' + lastUpdated;
  }
  offlineMessage.style.display = 'block';
}

function messageNoData() {
  // alert user that there is no data available
  noDataMessage.style.display = 'block';
}

function messageDataSaved() {
  // alert user that data has been saved for offline
  const lastUpdated = getLastUpdated();
  if (lastUpdated) {dataSavedMessage.textContent += ' on ' + lastUpdated;}
  dataSavedMessage.style.display = 'block';
}

function messageSaveError() {
  // alert user that data couldn't be saved offline
  saveErrorMessage.style.display = 'block';
}

/* Storage functions */

function getLastUpdated() {
  return localStorage.getItem('lastUpdated');
}

function setLastUpdated(date) {
  localStorage.setItem('lastUpdated', date);
}

function createIndexedDB() {
  if (!('indexedDB' in window)) {return null;}
  return idb.open('dashboardr', 1, function(upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('events')) {
      const eventsOS = upgradeDb.createObjectStore('events', {keyPath: 'id'});
    }
  });
}

function saveEventDataLocally(events) {
  if (!('indexedDB' in window)) {return null;}
  return dbPromise.then(db => {
    const tx = db.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    return Promise.all(events.map(event => store.put(event)))
    .catch(() => {
      tx.abort();
      throw Error('Events were not added to the store');
    });
  });
}

function getLocalEventData() {
  if (!('indexedDB' in window)) {return null;}
  return dbPromise.then(db => {
    const tx = db.transaction('events', 'readonly');
    const store = tx.objectStore('events');
    return store.getAll();
  });
}
