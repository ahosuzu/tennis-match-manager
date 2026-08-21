document.getElementById("takeGroupPhotoBtn")?.addEventListener("click", () => {
    localStorage.setItem("targetMatch", "group");
    localStorage.setItem("targetCourt", "group");
    window.location.href = "camera.html";
});

window.addEventListener("load", () => {
    const photo = localStorage.getItem("capturedPhoto");
    const matchIndex = localStorage.getItem("targetMatch");
    const court = localStorage.getItem("targetCourt");

    if (photo && matchIndex !== null && court !== null) {

        if (matchIndex === "group") {
            const img = document.getElementById("groupPhoto");
            if (img) {
                img.src = photo;
                img.style.display = "block";
            }
        } else {
            const target = document.querySelector(
                `.matchPhotoPreview[data-match-index="${matchIndex}"][data-court="${court}"]`
            );

            if (target) {
                target.src = photo;
                target.style.display = "block";
            }
        }
    }

    localStorage.removeItem("capturedPhoto");
    localStorage.removeItem("targetMatch");
    localStorage.removeItem("targetCourt");
});
