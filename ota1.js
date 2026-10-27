/* ============================================================
   VIETSTAY — OTA 1 FRONTEND
   ota1.js
   Channel: ota_1  |  Connects to Lụa Vàng CRS (Supabase)
   ============================================================ */

const SUPABASE_URL = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY     = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE      = `${SUPABASE_URL}/functions/v1`;
const REST_BASE    = `${SUPABASE_URL}/rest/v1`;

// Định danh kênh OTA 1 theo đúng API Contract của Bill (ĐÃ ĐỔI TỪ ota_2 THÀNH ota_1)
const SOURCE_CHANNEL = "ota_1";

let searchDates  = { check_in: null, check_out: null };
let selectedRoom = null;

async function callFn(name, body) {
  const res = await fetch(`${FN_BASE}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
      "apikey":        ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty */ }
  return { ok: res.ok, status: res.status, data };
}

async function restGet(table, params = "") {
  const res = await fetch(`${REST_BASE}/${table}${params}`, {
    headers: {
      "apikey":        ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`REST ${res.status}`);
  return res.json();
}

function showMsg(id, type, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `msg ${type}`;
  el.innerHTML = html;
}

function setBusy(btnId, busy, label = "Đang xử lý…") {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = busy;
  if (busy) {
    btn.dataset.orig = btn.textContent;
    btn.textContent  = label;
  } else {
    btn.textContent = btn.dataset.orig || btn.textContent;
  }
}

function vnd(n) {
  return Number(n).toLocaleString("vi-VN") + " ₫";
}

function rateStr(low, high) {
  if (low && high && String(low) !== String(high))
    return `${vnd(low)} – ${vnd(high)}/đêm`;
  if (low) return `${vnd(low)}/đêm`;
  return "Liên hệ";
}

const ROOM_TYPE_MAP = {
  deluxe: "Deluxe", superior: "Superior", suite: "Suite",
  family: "Family", villa: "Villa", standard: "Standard",
};
function roomTypeName(type) {
  return ROOM_TYPE_MAP[(type || "").toLowerCase()] || type || "Phòng";
}

(function initDates() {
  const today = new Date().toISOString().split("T")[0];
  const ciEl  = document.getElementById("check-in");
  const coEl  = document.getElementById("check-out");
  if (!ciEl || !coEl) return;
  ciEl.min = today;
  coEl.min = today;
  ciEl.addEventListener("change", () => {
    coEl.min = ciEl.value;
    if (coEl.value && coEl.value <= ciEl.value) coEl.value = "";
  });
})();

async function loadInventory() {
  try {
    const rows = await restGet(
      "channel_inventory",
      `?channel=eq.${SOURCE_CHANNEL}&select=room_type,available_count,updated_at&order=updated_at.desc`
    );

    if (!rows || rows.length === 0) return;

    const latestByType = new Map();
    rows.forEach(r => {
      const key = (r.room_type || "").toLowerCase();
      if (!latestByType.has(key)) latestByType.set(key, r);
    });

    const grid = document.getElementById("inv-grid");
    grid.innerHTML = "";

    latestByType.forEach(row => {
      const count = Number(row.available_count);
      const cls   = count === 0 ? "sold" : count <= 2 ? "low" : "";
      const card  = document.createElement("div");
      card.className = `inv-card ${cls}`;
      card.innerHTML = `
        <div class="inv-type">${roomTypeName(row.room_type)}</div>
        <div class="inv-count">${count}</div>
        <div class="inv-sub">phòng còn</div>
      `;
      grid.appendChild(card);
    });

    const latest = rows[0];
    if (latest?.updated_at) {
      const d = new Date(latest.updated_at);
      document.getElementById("inv-updated").textContent =
        `cập nhật ${d.toLocaleTimeString("vi-VN")} ngày ${d.toLocaleDateString("vi-VN")}`;
    }
  } catch (err) {
    document.getElementById("inv-updated").textContent = "chưa đồng bộ";
  }
}

document.getElementById("search-btn").addEventListener("click", async () => {
  const checkIn  = document.getElementById("check-in").value;
  const checkOut = document.getElementById("check-out").value;

  if (!checkIn || !checkOut) {
    showMsg("search-status", "warning", "Vui lòng chọn cả ngày nhận và trả phòng.");
    return;
  }
  if (checkIn >= checkOut) {
    showMsg("search-status", "error", "Ngày nhận phòng phải trước ngày trả phòng.");
    return;
  }

  searchDates  = { check_in: checkIn, check_out: checkOut };
  selectedRoom = null;
  const roomInput = document.getElementById("selected-room");
  roomInput.value = "";
  roomInput.classList.remove("has-value");
  document.getElementById("rooms-container").innerHTML = "";

  setBusy("search-btn", true);
  showMsg("search-status", "loading", "Đang kiểm tra phòng trống…");

  try {
    const { ok, data } = await callFn("check_availability", {
      check_in:  checkIn,
      check_out: checkOut,
      source_channel: SOURCE_CHANNEL,
    });

    if (!ok) {
      showMsg("search-status", "error", data.error || "Không thể kết nối CRS. Thử lại sau.");
      return;
    }

    const rooms = data.available_rooms || [];
    if (rooms.length === 0) {
      showMsg("search-status", "warning",
        "Không có phòng trống trong khoảng thời gian này. Vui lòng chọn ngày khác.");
      return;
    }

    showMsg("search-status", "success",
      `Tìm thấy <strong>${rooms.length}</strong> phòng trống.`);
    renderRooms(rooms);
  } catch (err) {
    showMsg("search-status", "error", `Lỗi kết nối: ${err.message}`);
  } finally {
    setBusy("search-btn", false);
  }
});

function renderRooms(rooms) {
  const container = document.getElementById("rooms-container");
  container.innerHTML = "";

  const list = document.createElement("div");
  list.className = "room-list";

  rooms.forEach(room => {
    const row = document.createElement("div");
    row.className  = "room-row";
    row.dataset.id = room.room_id;
    row.innerHTML  = `
      <div class="room-info">
        <h4>${roomTypeName(room.room_type)} &mdash;
          <span style="font-family:var(--sans);font-size:0.85rem">${room.room_id}</span>
        </h4>
        <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} người</div>
      </div>
      <div class="room-rate">${rateStr(room.rate_low, room.rate_high)}</div>
      <button class="btn-select" data-id="${room.room_id}">Chọn</button>
    `;
    list.appendChild(row);
  });

  container.appendChild(list);

  list.addEventListener("click", e => {
    const btn = e.target.closest(".btn-select");
    if (!btn) return;
    const room = rooms.find(r => r.room_id === btn.dataset.id);
    if (room) pickRoom(room, list);
  });
}

function pickRoom(room, listEl) {
  selectedRoom = room;
  listEl.querySelectorAll(".room-row").forEach(r => {
    r.classList.toggle("selected-row", r.dataset.id === room.room_id);
  });
  const input = document.getElementById("selected-room");
  input.value = room.room_id;
  input.classList.add("has-value");
  document.getElementById("book-section")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildGuestPayload() {
  const rawName   = (document.getElementById("guest-name")?.value || "").trim();
  const rawEmail  = (document.getElementById("guest-email")?.value || "").trim();
  const rawPhone  = (document.getElementById("guest-phone")?.value || "").trim();
  const extraRaw  = (document.getElementById("extra-guests")?.value || "").trim();

  const guests = [];
  if (rawName) {
    guests.push({
      guest_name: rawName,
      email: rawEmail || undefined,
      phone: rawPhone || undefined,
    });
  }

  if (extraRaw) {
    extraRaw.split(/\n|;/).map(s => s.trim()).filter(Boolean).forEach(line => {
      const parts = line.split(",").map(p => p.trim());
      if (parts[0]) {
        guests.push({
          guest_name: parts[0],
          email: parts[1] || undefined,
          phone: parts[2] || undefined,
        });
      }
    });
  }

  return {
    guest_name: rawName,
    email:      rawEmail || undefined,
    phone:      rawPhone || undefined,
    guest:      guests[0] || { guest_name: rawName },
    guests:     guests,
  };
}

document.getElementById("book-btn").addEventListener("click", async () => {
  const roomId       = (document.getElementById("selected-room").value || "").trim();
  const guestPayload = buildGuestPayload();

  if (!roomId) {
    showMsg("book-status", "warning",
      'Chưa chọn phòng. Tìm phòng ở bước 1 và nhấn «Chọn».');
    return;
  }
  if (!guestPayload.guest_name) {
    showMsg("book-status", "warning", "Vui lòng nhập tên khách lưu trú.");
    return;
  }
  if (!searchDates.check_in || !searchDates.check_out) {
    showMsg("book-status", "warning", "Chưa có ngày lưu trú. Quay lại bước 1.");
    return;
  }

  setBusy("book-btn", true);
  showMsg("book-status", "loading", "Đang tạo đặt phòng…");
  document.getElementById("booking-result").classList.add("hidden");

  try {
    const { ok, status, data } = await callFn("create_booking", {
      room_id:        roomId,
      check_in:       searchDates.check_in,
      check_out:      searchDates.check_out,
      source_channel: SOURCE_CHANNEL,
      ...guestPayload,
    });

    if (status === 409) {
      showMsg("book-status", "error",
        "HTTP 409 Conflict: Phòng này vừa có người đặt trùng ngày. Vui lòng chọn phòng khác.");
      loadInventory();
      return;
    }
    if (!ok) {
      showMsg("book-status", "error", data.error || "Không thể tạo booking. Thử lại sau.");
      return;
    }

    const allNames = guestPayload.guests.map(g => g.guest_name).join(", ");
    showMsg("book-status", "success", "Đặt phòng thành công. Lưu lại mã bên dưới.");
    renderBookingPanel(data.booking_id, roomId, allNames,
      searchDates.check_in, searchDates.check_out);
    document.getElementById("booking-id-input").value = data.booking_id;

    loadInventory();
  } catch (err) {
    showMsg("book-status", "error", `Lỗi kết nối: ${err.message}`);
  } finally {
    setBusy("book-btn", false);
  }
});

function renderBookingPanel(bookingId, roomId, guestName, checkIn, checkOut) {
  const panel  = document.getElementById("booking-result");
  const copyId = "copy-bid-btn";

  panel.innerHTML = `
    <div class="bp-label">Mã đặt phòng — lưu lại để dùng khi cần hủy</div>
    <div class="bp-code">${bookingId}</div>
    <div class="bp-detail">
      ${roomId} &nbsp;·&nbsp; ${guestName} &nbsp;·&nbsp; ${checkIn} → ${checkOut}
      &nbsp;·&nbsp; <strong style="color:var(--gold)">VietStay / OTA 1</strong>
    </div>
    <button class="btn-copy" id="${copyId}">Sao chép mã</button>
  `;
  panel.classList.remove("hidden");

  document.getElementById(copyId).addEventListener("click", () => {
    navigator.clipboard.writeText(bookingId)
      .then(() => {
        const btn = document.getElementById(copyId);
        btn.textContent = "Đã sao chép ✓";
        setTimeout(() => { btn.textContent = "Sao chép mã"; }, 2200);
      })
      .catch(() => { prompt("Sao chép mã booking:", bookingId); });
  });
}

document.getElementById("cancel-btn").addEventListener("click", async () => {
  const bookingId = (document.getElementById("booking-id-input").value || "").trim();

  if (!bookingId) {
    showMsg("cancel-status", "warning", "Vui lòng nhập mã đặt phòng cần hủy.");
    return;
  }

  const ok = window.confirm(
    `Xác nhận hủy đặt phòng:\n\n${bookingId}\n\nHành động này không thể hoàn tác.`
  );
  if (!ok) return;

  setBusy("cancel-btn", true);
  showMsg("cancel-status", "loading", "Đang xử lý hủy đặt phòng…");

  try {
    const { ok: reqOk, status, data } = await callFn("cancel_booking", {
      booking_id:     bookingId,
      source_channel: SOURCE_CHANNEL,
    });

    if (status === 404) {
      showMsg("cancel-status", "error",
        "Không tìm thấy booking này. Kiểm tra lại mã đặt phòng.");
      return;
    }
    if (status === 400) {
      showMsg("cancel-status", "warning",
        data.error || "Booking này không ở trạng thái có thể hủy.");
      return;
    }
    if (!reqOk) {
      showMsg("cancel-status", "error", data.error || "Không thể hủy booking. Thử lại sau.");
      return;
    }

    showMsg("cancel-status", "success",
      `Đã hủy thành công booking <strong>${bookingId}</strong>.`);
    document.getElementById("booking-id-input").value = "";

    loadInventory();
  } catch (err) {
    showMsg("cancel-status", "error", `Lỗi kết nối: ${err.message}`);
  } finally {
    setBusy("cancel-btn", false);
  }
});

loadInventory();
setInterval(loadInventory, 30000);
