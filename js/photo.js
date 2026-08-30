// 集合写真ボタン → カメラ起動（ページ遷移なし）
document.getElementById("takeGroupPhotoBtn").addEventListener("click", () => {
    currentTargetMatch = "group";
    currentTargetCourt = "group";

    document.getElementById("cameraArea").style.display = "flex";
    startCamera();
});
