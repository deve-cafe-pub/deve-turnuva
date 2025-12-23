import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWtAjBA2cBNZdMnR9s88uyV6h61RFMmw0",
    authDomain: "deve-3b098.firebaseapp.com",
    databaseURL: "https://deve-3b098-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "deve-3b098",
    storageBucket: "deve-3b098.firebasestorage.app",
    messagingSenderId: "709312232350",
    appId: "1:709312232350:web:0428b59946fa7ca102348f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let players = [];
let matches = [];

const dbRef = ref(db, 'turnuva');

document.getElementById('loading').style.display = 'block';

onValue(dbRef, (snapshot) => {
    document.getElementById('loading').style.display = 'none';
    if (snapshot.exists()) {
        const data = snapshot.val();
        players = data.players || [];
        matches = data.matches || [];
        
        renderPodium();
        renderMatchHistory();
    }
});

function renderPodium() {
    players.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.average !== a.average) return b.average - a.average;
        return a.totalTime - b.totalTime;
    });

    document.getElementById('first-name').textContent = players[0]?.name || '-';
    document.getElementById('first-points').textContent = players[0] ? `${players[0].points} Puan` : '0 Puan';
    
    document.getElementById('second-name').textContent = players[1]?.name || '-';
    document.getElementById('second-points').textContent = players[1] ? `${players[1].points} Puan` : '0 Puan';
    
    document.getElementById('third-name').textContent = players[2]?.name || '-';
    document.getElementById('third-points').textContent = players[2] ? `${players[2].points} Puan` : '0 Puan';
}

function renderMatchHistory() {
    const list = document.getElementById('matchHistory');
    list.innerHTML = '';
    if (matches.length === 0) {
        list.innerHTML = '<li style="text-align:center; color:#999;">Henüz maç yok</li>';
        return;
    }
    matches.slice(0, 10).forEach(m => {
        list.innerHTML += `<li>${m}</li>`;
    });
}
