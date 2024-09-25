document.getElementById("openBtn").addEventListener("click", openSidebar);
document.getElementById("closeBtn").addEventListener("click", closeSidebar);
document.getElementById("dropbtnID").addEventListener("click", toggleDropdown);
document.getElementById("buyButton").addEventListener("click", buyProduct);
document.getElementById("trialBuyButton").addEventListener("click", buyProduct);

// Sidebar açılırsa genişliğini 250px'e çıkarır ve maincontainer'ı 250px soldan iter. Aynı zamanda centerContainer ve inputinside responsive hale geliyor
function openSidebar() {
    document.getElementById("sidebar").style.width = "250px";
    document.getElementById("maincontainer").style.marginLeft = "250px";
    document.getElementById("centerContainer").style.width = "100%";
    document.getElementById("inputinside").style.width = "100%";

    document.getElementById("freeTrialEndedContainer").style.width = "100%";
}
// Sidebar kapanırsa içeriği eski haline getiriyor aynı zamanda responsive hale geliyor

function closeSidebar() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("maincontainer").style.marginLeft = "0";
    document.getElementById("centerContainer").style.width = "98vw";
    document.getElementById("inputinside").style.width = "100%";

    document.getElementById("freeTrialEndedContainer").style.width = "98vw";
}

function toggleDropdown() {
    var dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.classList.toggle("show");
}

function buyProduct() {
    window.location.href = 'https://hukukasistani.com/pricing';
}