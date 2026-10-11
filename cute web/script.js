// ====== CẤU HÌNH ======
// Video jumpscare phát lại từ đầu mỗi bao nhiêu giây
const LOOP_SECONDS = 14;

// Danh sách ảnh trong thư mục assets/. Thêm ảnh của bạn vào đây.
const CAT_IMAGES = ["assets/cat.svg"];

// Số lượng ảnh bay trên nền
const CAT_COUNT = 16;
// ======================

const catsLayer = document.getElementById("cats");

function rand(min, max) { return Math.random() * (max - min) + min; }

// Tránh đặt ảnh vào vùng giữa trang (chỗ nút bấm)
function inCenterZone(x, y) {
  return x > 25 && x < 75 && y > 28 && y < 72;
}

function spawnCats() {
  catsLayer.innerHTML = "";
  for (let i = 0; i < CAT_COUNT; i++) {
    let x, y;
    do { x = rand(2, 92); y = rand(2, 88); } while (inCenterZone(x, y));

    const img = document.createElement("img");
    img.className = "cat";
    img.src = CAT_IMAGES[i % CAT_IMAGES.length];
    img.alt = "";
    img.style.left = x + "%";
    img.style.top = y + "%";
    img.style.width = rand(60, 120) + "px";
    img.style.setProperty("--rot", rand(-12, 12) + "deg");
    img.style.setProperty("--dur", rand(4, 8) + "s");
    img.style.setProperty("--delay", rand(0, 3) + "s");
    catsLayer.appendChild(img);
  }
}

// Tốc độ tải: 25% mỗi giây (đổi số này nếu muốn nhanh/chậm hơn)
const PERCENT_PER_SECOND = 25;

const modal = document.getElementById("modal");
const pctText = document.getElementById("pct");
const fill = document.getElementById("fill");
const bar = fill.parentElement;
let loading = false;

function startLoading() {
  if (loading) return;
  loading = true;
  modal.hidden = false;

  const start = performance.now();

  function tick(now) {
    const pct = Math.min(100, ((now - start) / 1000) * PERCENT_PER_SECOND);
    const shown = Math.floor(pct);
    fill.style.width = pct + "%";
    pctText.textContent = shown + "%";
    bar.setAttribute("aria-valuenow", shown);

    if (pct < 100) {
      requestAnimationFrame(tick);
    } else {
      // Đủ 100% thì jumpscare
      setTimeout(startScare, 300);
    }
  }
  requestAnimationFrame(tick);
}

// ====== JUMPSCARE ======
const scare = document.getElementById("scare");

function maxVolume() {
  scare.volume = 1.0;
  scare.muted = false;
}

function restartScare() {
  scare.currentTime = 0;
  scare.play().catch(() => {});
}

function startScare() {
  modal.hidden = true;
  document.body.classList.add("scared");

  maxVolume();
  scare.currentTime = 0;
  scare.play().catch(() => {
    // Trình duyệt chặn tiếng: phát tắt tiếng, bật tiếng ở lần chạm/bấm đầu tiên
    scare.muted = true;
    scare.play().catch(() => {});
    const unlock = () => { maxVolume(); scare.play().catch(() => {}); };
    ["click", "touchstart", "keydown"].forEach(ev =>
      document.addEventListener(ev, unlock, { once: true })
    );
  });

  // Lặp lại mỗi 14 giây hoặc khi hết video
  scare.addEventListener("timeupdate", () => {
    if (scare.currentTime >= LOOP_SECONDS) restartScare();
  });
  scare.addEventListener("ended", restartScare);

  // Không cho dừng, giữ âm lượng cố định
  scare.addEventListener("pause", () => { if (!scare.ended) scare.play().catch(() => {}); });
  scare.addEventListener("volumechange", () => {
    if (scare.volume !== 1 && !scare.muted) scare.volume = 1;
  });

  // Chặn chuột phải, double-click và phím tắt điều khiển video
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("dblclick", e => e.preventDefault());
  document.addEventListener("keydown", e => e.preventDefault());
}

document.getElementById("go").addEventListener("click", startLoading);

spawnCats();
