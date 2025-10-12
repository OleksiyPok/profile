const menuItems = document.querySelectorAll(".menu-item");
const submenuItems = document.querySelectorAll(".submenu-item");
const viewer = document.getElementById("viewer");
const sidebar = document.querySelector(".sidebar");

let selectedSrc = "./assets/profile/Cpp/Certificate_Cpp_Pro.jpg";
let scale = 1;

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});

submenuItems.forEach((item) => {
  item.addEventListener("click", () => {
    submenuItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    selectedSrc = item.getAttribute("data-src");
    updateURL(selectedSrc);
    showDocument();
  });
});

function showDocument() {
  viewer.innerHTML = "";
  const isPDF = selectedSrc.toLowerCase().endsWith(".pdf");
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  if (isPDF && isMobile) {
    window.open(selectedSrc + "#zoom=page-fit", "_blank");
    return;
  }

  if (isPDF) {
    const iframe = document.createElement("iframe");
    iframe.src = selectedSrc + "#zoom=page-fit";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.display = "block";
    viewer.appendChild(iframe);
  } else {
    const img = document.createElement("img");
    img.src = selectedSrc;
    img.alt = "Document";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.style.objectFit = "contain";
    img.style.transformOrigin = "center center";
    img.style.transform = "scale(1)";
    viewer.appendChild(img);

    img.onload = () => {
      scale = 1;
      img.style.transform = "scale(1)";
      viewer.scrollTo(0, 0);
    };
  }

  const zoomControls = document.getElementById("zoomControls");
  if (zoomControls) {
    zoomControls.style.display = isPDF ? "none" : "flex";
  }
}

function updateURL(src) {
  const url = new URL(window.location);
  url.searchParams.set("doc", src);
  window.history.replaceState({}, "", url);
}

viewer.addEventListener("wheel", (e) => {
  const img = viewer.querySelector("img");
  if (!img) return;
  e.preventDefault();
  scale *= e.deltaY < 0 ? 1.1 : 0.9;
  scale = Math.min(Math.max(0.1, scale), 5);
  img.style.transform = `scale(${scale})`;
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const docParam = params.get("doc");

  if (docParam) {
    const target = Array.from(submenuItems).find((i) => i.getAttribute("data-src") === docParam);
    if (target) {
      submenuItems.forEach((i) => i.classList.remove("active"));
      target.classList.add("active");
      selectedSrc = docParam;
      const parentMenu = target.closest(".submenu")?.previousElementSibling;
      if (parentMenu) parentMenu.classList.add("active");
    }
  } else {
    const certificatesMenu = Array.from(menuItems).find((item) => item.textContent.trim() === "Certificates");
    if (certificatesMenu) {
      certificatesMenu.classList.add("active");
      const firstCert = certificatesMenu.nextElementSibling?.querySelector(".submenu-item");
      if (firstCert) {
        submenuItems.forEach((i) => i.classList.remove("active"));
        firstCert.classList.add("active");
        selectedSrc = firstCert.getAttribute("data-src");
      }
    }
  }

  injectControls();
  showDocument();
});

function injectControls() {
  const controls = document.createElement("div");
  controls.className = "sidebar-controls";
  controls.innerHTML = `
    <div class="control-row" id="zoomControls">
      <button id="zoomIn" title="Zoom in">➕</button>
      <button id="zoomOut" title="Zoom out">➖</button>
    </div>
    <hr class="divider">
    <div class="control-row fixed-row">
      <button id="copyLink" title="Copy link">🔗</button>
      <button id="printDoc" title="Print document">🖨️</button>
    </div>
  `;
  sidebar.appendChild(controls);

  document.getElementById("copyLink").addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Link copied!");
    });
  });

  document.getElementById("printDoc").addEventListener("click", () => {
    if (selectedSrc.toLowerCase().endsWith(".pdf")) {
      const win = window.open(selectedSrc, "_blank");
      if (win) win.print();
    } else {
      const win = window.open("");
      win.document.write(`<img src="${selectedSrc}" style="max-width:100%">`);
      win.document.close();
      win.print();
    }
  });

  document.getElementById("zoomIn").addEventListener("click", () => {
    const img = viewer.querySelector("img");
    if (img) {
      scale = Math.min(scale * 1.1, 5);
      img.style.transform = `scale(${scale})`;
    }
  });

  document.getElementById("zoomOut").addEventListener("click", () => {
    const img = viewer.querySelector("img");
    if (img) {
      scale = Math.max(scale * 0.9, 0.1);
      img.style.transform = `scale(${scale})`;
    }
  });

  document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("hidden");
    document.body.classList.toggle("sidebar-hidden");
  });
}
