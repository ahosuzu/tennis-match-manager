// js/app.js
let members = {};
let matchResults = [];
let currentTemplate = [];
let playerCount = 5;
let hasMatchStarted = false;

/* 常連候補（必要に応じて編集可） */
const REGULAR_NAMES = [
    "たけし", "しんじ", "まさと", "けんじ",
    "こうじ", "さとる", "ゆうき", "ひろし",
    "なおき", "けい"
];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("playerCount").onchange = onPlayerCountChange;
    onPlayerCountChange();

    document.getElementById("newEventBtn").onclick = onNewEvent;
    document.getElementById("applyMembersBtn").onclick = onApplyMembers;
    document.getElementById("shuffleBtn").onclick = onShuffle;
    document.getElementById("addMatchBtn").onclick = onAddMatch;
    document.getElementById("saveImageBtn").onclick = onSaveImage;
});

/* 人数変更 */
function onPlayerCountChange() {
    playerCount = parseInt(document.getElementById("playerCount").value);
    createMemberInputs(playerCount);
}

/* メンバー入力欄生成（常連補助） */
function createMemberInputs(count) {
    const container = document.getElementById("memberInputs");
    container.innerHTML = "";

    for (let i = 1; i <= count; i++) {
        const row = document.createElement("div");
        row.className = "member-input-row";

        const label = document.createElement("label");
        label.textContent = `${i}番`;

        const input = document.createElement("input");
        input.id = `member${i}`;
        input.placeholder = REGULAR_NAMES[i - 1] || `メンバー${i}`;

        row.appendChild(label);
        row.appendChild(input);
        container.appendChild(row);
    }
}

/* 新しいイベント */
function onNewEvent() {
    members = {};
    matchResults = [];
    currentTemplate = [];
    hasMatchStarted = false;

    document.getElementById("matchTable").innerHTML = "";
    document.getElementById("rankingArea").innerHTML = "";

    const gp = document.getElementById("groupPhoto");
    gp.src = "";
    gp.style.display = "none";

    const shuffleBtn = document.getElementById("shuffleBtn");
    shuffleBtn.disabled = false;
    shuffleBtn.textContent = "シャッフル！🔄（試合開始前のみ）";

    createMemberInputs(playerCount);
}

/* メンバー決定＋試合表生成 */
function onApplyMembers() {
    members = {};
    for (let i = 1; i <= playerCount; i++) {
        const v = document.getElementById(`member${i}`).value;
        members[i] = v || (REGULAR_NAMES[i - 1] || `${i}番`);
    }

    currentTemplate = getTemplate(playerCount);
    matchResults = Array(currentTemplate.length).fill(null).map(() => ({ A: "", B: "" }));
    hasMatchStarted = false;

    renderMatchCards(currentTemplate, members, matchResults);
    updateRanking();

    const shuffleBtn = document.getElementById("shuffleBtn");
    shuffleBtn.disabled = false;
    shuffleBtn.textContent = "シャッフル！🔄（試合開始前のみ）";
}

/* シャッフル（試合開始前のみ） */
function onShuffle() {
    if (hasMatchStarted) {
        alert("試合開始後はシャッフルできません。");
        return;
    }

    currentTemplate = getTemplate(playerCount);
    matchResults = Array(currentTemplate.length).fill(null).map(() => ({ A: "", B: "" }));

    renderMatchCards(currentTemplate, members, matchResults);
    updateRanking();
}

/* スコア保存（プルダウン） */
function saveResult(matchIndex, court) {
    const select = document.getElementById(`score_${court}_${matchIndex}`);
    const score = select.value;
    matchResults[matchIndex][court] = score;

    const resultText = document.getElementById(`resultText_${court}_${matchIndex}`);
    resultText.textContent = `結果：${score || "-"}`;

    const card = document.getElementById(`matchCard_${matchIndex}`);
    if (card) {
        const res = matchResults[matchIndex];
        if ((res.A && res.A.trim() !== "") || (res.B && res.B.trim() !== "")) {
            card.classList.add("match-card-done");
            hasMatchStarted = true;
            lockShuffleIfStarted();
        } else {
            card.classList.remove("match-card-done");
        }
    }

    updateRanking();
}

/* シャッフル禁止 */
function lockShuffleIfStarted() {
    if (!hasMatchStarted) return;
    const shuffleBtn = document.getElementById("shuffleBtn");
    shuffleBtn.disabled = true;
    shuffleBtn.textContent = "シャッフル不可（試合開始後）";
}

/* ランキング計算（ダブルス前提） */
function updateRanking() {
    const totals = {};
    for (let i = 1; i <= playerCount; i++) {
        totals[i] = { games: 0, matches: 0 };
    }

    currentTemplate.forEach((row, matchIndex) => {
        const courts = row.length === 1 ? ["A"] : ["A", "B"];

        courts.forEach((court, ci) => {
            const score = matchResults[matchIndex][court];
            if (!score) return;

            const [g1, g2] = score.split("-").map(Number);
            const text = row[ci];

            // ★★★ ここが今回の本質的修正 ★★★
            const teams = text.split(" vs ");

            const team1 = teams[0].split("・").map(n => parseInt(n));
            const team2 = teams[1].split("・").map(n => parseInt(n));

            [...team1, ...team2].forEach(num => {
                totals[num].games += (team1.includes(num) ? g1 : g2);
                totals[num].matches++;
            });
        });
    });

    const ranking = [];
    for (let i = 1; i <= playerCount; i++) {
        const avg = totals[i].matches > 0 ? (totals[i].games / totals[i].matches) : 0;
        ranking.push({ num: i, name: members[i], avg });
    }

    ranking.sort((a, b) => b.avg - a.avg);
    renderRanking(ranking);
}

/* ランキング描画 */
function renderRanking(ranking) {
    const container = document.getElementById("rankingArea");
    container.innerHTML = "";

    ranking.forEach((r, index) => {
        const card = document.createElement("div");
        card.className = "ranking-card";

        if (index === 0) card.classList.add("gold");
        if (index === 1) card.classList.add("silver");
        if (index === 2) card.classList.add("bronze");

        const left = document.createElement("div");
        left.textContent = `${index + 1}位：${r.name}`;

        const right = document.createElement("div");
        right.textContent = `平均 ${r.avg.toFixed(2)} ゲーム`;

        const bar = document.createElement("div");
        bar.className = "bar-container";

        const inner = document.createElement("div");
        inner.className = "bar-inner";
        inner.style.width = `${Math.min(r.avg * 20, 100)}%`;

        bar.appendChild(inner);

        card.appendChild(left);
        card.appendChild(right);
        card.appendChild(bar);

        container.appendChild(card);
    });
}

/* 試合カード描画（ダブルス＋プルダウン＋写真） */
function renderMatchCards(template, members, matchResults) {
    const container = document.getElementById("matchTable");
    container.innerHTML = "";

    template.forEach((row, matchIndex) => {
        const card = document.createElement("div");
        card.className = "match-card";
        card.id = `matchCard_${matchIndex}`;

        row.forEach((text, ci) => {
            const court = ci === 0 ? "A" : "B";

            // ★★★ ここが今回の本質的修正 ★★★
            const teams = text.split(" vs ");

            const team1Nums = teams[0].split("・").map(n => parseInt(n));
            const team2Nums = teams[1].split("・").map(n => parseInt(n));

            const team1 = team1Nums.map(n => members[n]);
            const team2 = team2Nums.map(n => members[n]);

            const block = document.createElement("div");
            block.className = "match-block";

            const scoreId = `score_${court}_${matchIndex}`;

            block.innerHTML = `
                <div><strong>${court}コート</strong></div>
                <div>${team1.join("・")} vs ${team2.join("・")}</div>

                <select id="${scoreId}" onchange="saveResult(${matchIndex}, '${court}')">
                    <option value="">スコアを選択</option>
                    <option value="0-4">0-4</option>
                    <option value="1-3">1-3</option>
                    <option value="2-2">2-2</option>
                    <option value="2-3">2-3</option>
                    <option value="3-2">3-2</option>
                    <option value="3-1">3-1</option>
                    <option value="4-0">4-0</option>
                </select>

                <div id="resultText_${court}_${matchIndex}">結果：-</div>

                <button onclick="openCamera(${matchIndex}, '${court}')">
                    ${court}コート写真撮影（5秒タイマー）
                </button>

                <img class="matchPhotoPreview"
                     data-match-index="${matchIndex}"
                     data-court="${court}">
            `;

            card.appendChild(block);
        });

        container.appendChild(card);
    });
}

/* 追加試合作成（ダブルス） */
function onAddMatch() {
    const playCounts = {};
    for (let i = 1; i <= playerCount; i++) {
        playCounts[i] = 0;
    }

    currentTemplate.forEach((row) => {
        const courts = row.length === 1 ? ["A"] : ["A", "B"];

        courts.forEach((court, ci) => {
            const text = row[ci];
            const teams = text.split(" vs ");
            const team1 = teams[0].split("・").map(n => parseInt(n));
            const team2 = teams[1].split("・").map(n => parseInt(n));

            [...team1, ...team2].forEach(num => playCounts[num]++);
        });
    });

    const sorted = Object.entries(playCounts)
        .sort((a, b) => a[1] - b[1])
        .map(([num]) => parseInt(num));

    const selected = sorted.slice(0, 4);

    const newMatch = [
        `${selected[0]}・${selected[1]} vs ${selected[2]}・${selected[3]}`
    ];

    currentTemplate.push(newMatch);
    matchResults.push({ A: "" });

    renderMatchCards(currentTemplate, members, matchResults);
    updateRanking();
}

/* 結果保存 */
function onSaveImage() {
    html2canvas(document.body).then(canvas => {
        const link = document.createElement("a");
        link.download = "tennis_result.png";
        link.href = canvas.toDataURL();
        link.click();
    });
}

/* テンプレート取得（template.js はそのまま利用） */
function getTemplate(playerCount) {
    if (playerCount === 10) return TEMPLATE_10;
    if (playerCount === 11) return TEMPLATE_11;
    if (playerCount === 12) return TEMPLATE_12;
    if (playerCount === 5)  return TEMPLATE_5;
    if (playerCount === 6)  return TEMPLATE_6;
    return [];
}
