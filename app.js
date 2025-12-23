import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

async function saveToFirebase() {
    try {
        await set(dbRef, {
            players: players,
            matches: matches
        });
    } catch (e) {
        alert("Hata oluştu: " + e.message);
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('content-' + tabId).classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
}

window.deletePlayer = async (id) => {
    if(confirm('Silmek istediğine emin misin?')) {
        players = players.filter(p => p.id !== id);
        await saveToFirebase();
    }
};

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loading').style.display = 'block';
    
    onValue(dbRef, (snapshot) => {
        document.getElementById('loading').style.display = 'none';
        if (snapshot.exists()) {
            const data = snapshot.val();
            players = data.players || [];
            matches = data.matches || [];
            
            renderLeaderboard();
            updateSelects();
            renderPlayerList();
            renderMatchHistory();
        } else {
            console.log("Veri yok, yeni başlıyoruz.");
        }
    });

    document.getElementById('tab-puan').addEventListener('click', () => switchTab('puan'));
    document.getElementById('tab-mac').addEventListener('click', () => switchTab('mac'));
    document.getElementById('tab-ayar').addEventListener('click', () => switchTab('ayar'));

    document.getElementById('btnAddPlayer').onclick = async () => {
        const nameInput = document.getElementById('newPlayerName');
        const name = nameInput.value.trim();
        if (!name) return alert("İsim giriniz!");

        players.push({
            id: Date.now(),
            name: name,
            played: 0, wins: 0, points: 0, average: 0, totalTime: 0
        });

        nameInput.value = '';
        await saveToFirebase();
    };

    document.getElementById('btnSaveMatch').onclick = async () => {
        const p1Id = parseInt(document.getElementById('p1Select').value);
        const p2Id = parseInt(document.getElementById('p2Select').value);
        const s1 = parseInt(document.getElementById('score1').value);
        const s2 = parseInt(document.getElementById('score2').value);
        const time = parseInt(document.getElementById('matchTime').value);

        if (isNaN(p1Id) || isNaN(p2Id) || p1Id === p2Id) return alert("Oyuncu seçimi hatalı.");
        if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) return alert("Geçerli skor giriniz.");
        if (isNaN(time) || time <= 0) return alert("Geçerli süre giriniz.");

        let p1 = players.find(p => p.id === p1Id);
        let p2 = players.find(p => p.id === p2Id);

        p1.played++; p2.played++;
        p1.totalTime += time; p2.totalTime += time;
        p1.average += (s1 - s2); p2.average += (s2 - s1);

        if (s1 > s2) { 
            p1.wins++; p1.points += 3; 
        } else if (s2 > s1) { 
            p2.wins++; p2.points += 3; 
        } else {
            p1.points += 1; p2.points += 1;
        }

        matches.unshift(`⏱ ${p1.name} (${s1}) - (${s2}) ${p2.name} | ${time}dk`);
        
        document.getElementById('score1').value = '';
        document.getElementById('score2').value = '';
        document.getElementById('matchTime').value = '';

        await saveToFirebase();
        alert("Maç kaydedildi!");
    };

    document.getElementById('btnReset').onclick = async () => {
        if(confirm('DİKKAT! TÜM VERİTABANI SİLİNECEK!')) {
            players = [];
            matches = [];
            await saveToFirebase();
        }
    };
});

function renderLeaderboard() {
    players.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.average !== a.average) return b.average - a.average;
        return a.totalTime - b.totalTime;
    });

    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    players.forEach((p, index) => {
        let rowClass = index === 0 ? 'rank-1' : '';
        tbody.innerHTML += `
            <tr class="${rowClass}">
                <td>${index + 1}</td>
                <td style="font-weight:bold">${p.name}</td>
                <td>${p.played}</td>
                <td>${p.points}</td>
                <td>${p.average > 0 ? '+' + p.average : p.average}</td>
                <td>${p.totalTime}</td>
            </tr>`;
    });
}

function updateSelects() {
    const p1 = document.getElementById('p1Select');
    const p2 = document.getElementById('p2Select');
    p1.innerHTML = '<option>Oyuncu 1</option>';
    p2.innerHTML = '<option>Oyuncu 2</option>';
    players.forEach(p => {
        let opt = `<option value="${p.id}">${p.name}</option>`;
        p1.innerHTML += opt; p2.innerHTML += opt;
    });
    document.getElementById('playerCount').innerText = players.length;
}

function renderPlayerList() {
    const list = document.getElementById('playerList');
    list.innerHTML = '';
    players.forEach(p => {
        list.innerHTML += `<li>${p.name} <button class="delete-btn" onclick="deletePlayer(${p.id})">Sil</button></li>`;
    });
}

function renderMatchHistory() {
    const list = document.getElementById('matchHistory');
    list.innerHTML = '';
    matches.slice(0, 10).forEach(m => {
        list.innerHTML += `<li>${m}</li>`;
    });
}
