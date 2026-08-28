// js/camera.js
let stream = null;
let currentTargetMatch = null;
let currentTargetCourt = null;
let countdownTimerId = null;

/* インカメラ固定でカメラ起動 */
async function startCamera() {
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }  // インカメラ固定
        });

        const video = document.getElementById("cameraVideo");
        video.srcObject = stream;
        video.style.display = "block";

        const preview = document.getElementById("cameraPreview");
        preview.style.display = "none";

        const countdown = document.getElementById("cameraCountdown");
        countdown.style.display = "none";
        countdown.textContent = "";

        const captureBtn = document.getElementById("captureBtn");
        const retakeBtn = document.getElementById("retakeBtn");
        const confirmBtn = document.getElementById("confirmBtn");

        captureBtn.style.display = "inline-block";
        captureBtn.disabled = false;
        retakeBtn.style.display = "none";
        confirmBtn.style.display = "none";

    } catch (e) {
        alert("カメラを起動できませんでした。権限を確認してください。");
        closeCamera();
    }
}

/* 試合写真用カメラオープン */
function openCamera(matchIndex, court) {
    currentTargetMatch = matchIndex;
    currentTargetCourt = court;

    const area = document.getElementById("cameraArea");
    area.style.display = "flex";

    setTimeout(() => {
        startCamera();
    }, 0);
}



function openGroupCamera() {
    currentTargetMatch = "group";
    currentTargetCourt = "group";

    const area = document.getElementById("cameraArea");
    area.style.display = "flex";

    setTimeout(() => {
        startCamera();
    }, 0);
}



/* 5秒タイマー撮影 */
document.getElementById("captureBtn").onclick = () => {
    const captureBtn = document.getElementById("captureBtn");
    const countdown = document.getElementById("cameraCountdown");

    captureBtn.disabled = true;
    countdown.style.display = "block";

    let remaining = 5;
    countdown.textContent = remaining;

    countdownTimerId = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(countdownTimerId);
            countdownTimerId = null;
            countdown.style.display = "none";
            doCapture();
        } else {
            countdown.textContent = remaining;
        }
    }, 1000);
};

/* 実際の撮影 */
function doCapture() {
    const video = document.getElementById("cameraVideo");
    if (!video.srcObject) {
        alert("カメラが起動していません。");
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataURL = canvas.toDataURL("image/png");

    const preview = document.getElementById("cameraPreview");
    preview.src = dataURL;
    preview.style.display = "block";

    video.style.display = "none";

    const captureBtn = document.getElementById("captureBtn");
    const retakeBtn = document.getElementById("retakeBtn");
    const confirmBtn = document.getElementById("confirmBtn");

    captureBtn.style.display = "none";
    retakeBtn.style.display = "inline-block";
    confirmBtn.style.display = "inline-block";

    // 試合カードへ一時反映（決定時に確定）
    if (currentTargetMatch !== null && currentTargetMatch !== "group") {
        const target = document.querySelector(
            `.matchPhotoPreview[data-match-index="${currentTargetMatch}"][data-court="${currentTargetCourt}"]`
        );
        if (target) {
            target.src = dataURL;
            target.style.display = "block";
        }
    }

    if (currentTargetMatch === "group") {
        const img = document.getElementById("groupPhoto");
        img.src = dataURL;
        img.style.display = "block";
    }

    // 試合写真が撮影された時点で試合開始扱い（シャッフル禁止）
    if (currentTargetMatch !== null && currentTargetMatch !== "group") {
        hasMatchStarted = true;
        lockShuffleIfStarted();
    }
}

/* 取り直し */
document.getElementById("retakeBtn").onclick = () => {
    const preview = document.getElementById("cameraPreview");
    const video = document.getElementById("cameraVideo");
    const captureBtn = document.getElementById("captureBtn");
    const retakeBtn = document.getElementById("retakeBtn");
    const confirmBtn = document.getElementById("confirmBtn");
    const countdown = document.getElementById("cameraCountdown");

    preview.style.display = "none";
    video.style.display = "block";

    captureBtn.style.display = "inline-block";
    captureBtn.disabled = false;
    retakeBtn.style.display = "none";
    confirmBtn.style.display = "none";

    countdown.style.display = "none";
    countdown.textContent = "";

    startCamera();
};

/* 決定（そのまま確定して閉じる） */
document.getElementById("confirmBtn").onclick = () => {
    closeCamera();
};

/* ×ボタンで閉じる（撮影前に戻る） */
document.getElementById("closeCameraBtn").onclick = () => {
    closeCamera();
};

function closeCamera() {
    if (countdownTimerId) {
        clearInterval(countdownTimerId);
        countdownTimerId = null;
    }

    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }

    const area = document.getElementById("cameraArea");
    area.style.display = "none";

    const video = document.getElementById("cameraVideo");
    const preview = document.getElementById("cameraPreview");
    const captureBtn = document.getElementById("captureBtn");
    const retakeBtn = document.getElementById("retakeBtn");
    const confirmBtn = document.getElementById("confirmBtn");
    const countdown = document.getElementById("cameraCountdown");

    video.srcObject = null;
    video.style.display = "block";

    preview.style.display = "none";

    captureBtn.style.display = "inline-block";
    captureBtn.disabled = false;
    retakeBtn.style.display = "none";
    confirmBtn.style.display = "none";

    countdown.style.display = "none";
    countdown.textContent = "";

    currentTargetMatch = null;
    currentTargetCourt = null;
}
