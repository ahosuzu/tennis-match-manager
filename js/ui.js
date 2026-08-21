/* メンバー入力欄を作成 */
function createMemberInputs(count) {
    const container = document.getElementById("memberInputs");
    container.innerHTML = "";

    for (let i = 1; i <= count; i++) {
        const input = document.createElement("input");
        input.id = `member${i}`;
        input.placeholder = `${i}番の名前`;
        container.appendChild(input);
    }
}

/* 試合カード描画 */
function renderMatchCards(template, members, matchResults) {
    const table = document.getElementById("matchTable");
    table.innerHTML = "";

    template.forEach((row, matchIndex) => {
        const card = document.createElement("div");
        card.className = "match-card";

        const header = document.createElement("div");
        header.className = "match-header";
        header.textContent = `試合 ${matchIndex + 1}`;
        card.appendChild(header);

        const courts = row.length === 1 ? ["A"] : ["A", "B"];

        courts.forEach((court, ci) => {
            const block = document.createElement("div");
            block.className = "court-block";

            const title = document.createElement("div");
            title.className = "court-title";
            title.textContent = `${court}コート`;
            block.appendChild(title);

            const text = row[ci];
            const teams = text.split("vs");
            const teamA = teams[0].split("・").map(n => parseInt(n));
            const teamB = teams[1].split("・").map(n => parseInt(n));

            const tags = document.createElement("div");
            tags.className = "player-tags";

            teamA.forEach(num => {
                const tag = document.createElement("div");
                tag.className = "player-tag teamA";
                tag.textContent = members[num];
                tags.appendChild(tag);
            });

            teamB.forEach(num => {
                const tag = document.createElement("div");
                tag.className = "player-tag teamB";
                tag.textContent = members[num];
                tags.appendChild(tag);
            });

            block.appendChild(tags);

            /* 結果入力欄 */
            const resultBlock = document.createElement("div");
            resultBlock.className = "result-block";

            const rowDiv = document.createElement("div");
            rowDiv.className = "result-row";

            const label = document.createElement("span");
            label.textContent = "結果：";
            rowDiv.appendChild(label);

            const select = document.createElement("select");
            select.id = `score_${court}_${matchIndex}`;
            select.onchange = () => {
                saveResult(matchIndex, court);
                card.classList.add("completed");
            };

            const scores = ["", "0-4", "1-3", "2-2", "2-3", "3-2", "3-1", "4-0"];
            scores.forEach(s => {
                const opt = document.createElement("option");
                opt.value = s;
                opt.textContent = s || "-";
                select.appendChild(opt);
            });

            rowDiv.appendChild(select);
            resultBlock.appendChild(rowDiv);

            const resultText = document.createElement("div");
            resultText.id = `resultText_${court}_${matchIndex}`;
            resultText.className = "result-display";
            resultText.textContent = "結果：-";
            resultBlock.appendChild(resultText);

            block.appendChild(resultBlock);

            /* ★★★ 撮影ボタン（ここが⑤の挿入場所） ★★★ */
            const photoBtn = document.createElement("button");
            photoBtn.textContent = `${court}コート写真📸`;
            photoBtn.onclick = () => {
                localStorage.setItem("targetMatch", matchIndex);
                localStorage.setItem("targetCourt", court);
                window.location.href = "camera.html";
            };
            block.appendChild(photoBtn);

            /* 試合写真プレビュー */
            const preview = document.createElement("img");
            preview.className = "matchPhotoPreview";
            preview.dataset.matchIndex = matchIndex;
            preview.dataset.court = court;
            preview.style.display = "none";
            block.appendChild(preview);

            card.appendChild(block);
        });

        table.appendChild(card);
    });
}

/* ランキング描画（あなたの app.js と同じ） */
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
