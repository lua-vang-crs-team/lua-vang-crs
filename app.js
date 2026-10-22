
/* ============================================================
   LỤA VÀNG RESORT & SPA — BOOKING FRONTEND
   app.js — Search → Book → Cancel
   ============================================================ */

// ── CONFIG ───────────────────────────────────────────────────
// Supabase project: scxjezoysmwyumyebuls
const SUPABASE_URL = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY     = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE      = `${SUPABASE_URL}/functions/v1`;

// ── STATE ────────────────────────────────────────────────────
let searchDates  = { check_in: null, check_out: null };
let selectedRoom = null;   // room object chosen by user

// ── CORE API CALL ─────────────────────────────────────────────
/**
 * POST to a Supabase Edge Function.
 * @param {string} name  - function name (e.g. "check_availability")
 * @param {object} body  - JSON payload
 * @returns {{ ok: boolean, status: number, data: object }}
 */
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
  try { data = await res.json(); } catch { /* empty response */ }

  return { ok: res.ok, status: res.status, data };
}

// ── UI HELPERS ───────────────────────────────────────────────

/** Show a status message inside an element. */
function showMsg(id, type, html) {
  const el = document.getElementById(id);
  el.className = `msg ${type}`;
  el.innerHTML = html;
}

function hideMsg(id) {
  const el = document.getElementById(id);
  el.className = "msg hidden";
  el.innerHTML = "";
}

/** Disable a button and show "Processing…" while waiting. */
function setBusy(btnId, busy) {
  const btn = document.getElementById(btnId);
  btn.disabled = busy;
  if (busy) {
    btn.dataset.orig = btn.textContent;
    btn.textContent  = "Processing…";
  } else {
    btn.textContent = btn.dataset.orig || btn.textContent;
  }
}

// ── FORMATTING ───────────────────────────────────────────────

function vnd(n) {
  return Number(n).toLocaleString("vi-VN") + " ₫";
}

function rateStr(low, high) {
  if (low && high && String(low) !== String(high))
    return `${vnd(low)} – ${vnd(high)}/night`;
  if (low)  return `${vnd(low)}/night`;
  return "Contact us";
}

const ROOM_TYPE_MAP = {
  deluxe: "Deluxe", superior: "Superior", suite: "Suite",
  family: "Family", villa: "Villa", standard: "Standard",
};
function roomTypeName(t) {
  return ROOM_TYPE_MAP[(t || "").toLowerCase()] || (t || "Room");
}

// ── DATE INITIALISATION ──────────────────────────────────────

(function initDates() {
  const today = new Date().toISOString().split("T")[0];
  const ciEl  = document.getElementById("check-in");
  const coEl  = document.getElementById("check-out");

  ciEl.min = today;
  coEl.min = today;

  ciEl.addEventListener("change", () => {
    // check-out must be at least 1 day after check-in
    coEl.min = ciEl.value;
    if (coEl.value && coEl.value <= ciEl.value) coEl.value = "";
  });
})();

// ══════════════════════════════════════════════════════════════
//  SECTION 1 — SEARCH (check_availability)
// ══════════════════════════════════════════════════════════════

document.getElementById("search-btn").addEventListener("click", async () => {
  const checkIn  = document.getElementById("check-in").value;
  const checkOut = document.getElementById("check-out").value;

  // — Validate inputs
  if (!checkIn || !checkOut) {
    showMsg("search-status", "warning", "Please select both check-in and check-out dates.");
    return;
  }
  if (checkIn >= checkOut) {
    showMsg("search-status", "error", "Check-in date must be before check-out date.");
    return;
  }

  // — Reset state
  searchDates  = { check_in: checkIn, check_out: checkOut };
  selectedRoom = null;
  const roomInput = document.getElementById("selected-room");
  roomInput.value = "";
  roomInput.classList.remove("has-value");
  document.getElementById("rooms-container").innerHTML = "";

  // — Call API
  setBusy("search-btn", true);
  showMsg("search-status", "loading", "Checking room availability…");

  try {
    const { ok, data } = await callFn("check_availability", {
      check_in:  checkIn,
      check_out: checkOut,
    });

    if (!ok) {
      showMsg("search-status", "error",
        data.error || "Unable to check room availability. Please try again later.");
      return;
    }

    const rooms = data.available_rooms || [];

    if (rooms.length === 0) {
      showMsg("search-status", "warning",
        "No rooms are available for these dates. Please try different dates.");
      return;
    }

    showMsg("search-status", "success",
      `Available rooms: <strong>${rooms.length}</strong>.`);
    renderRooms(rooms);

  } catch (err) {
    showMsg("search-status", "error", `Connection error: ${err.message}`);
  } finally {
    setBusy("search-btn", false);
  }
});

/** Render the list of available rooms. */
function renderRooms(rooms) {
  const container = document.getElementById("rooms-container");
  container.innerHTML = "";

  const list = document.createElement("div");
  list.className = "room-list";

  rooms.forEach((room) => {
    const row       = document.createElement("div");
    row.className   = "room-row";
    row.dataset.id  = room.room_id;

    row.innerHTML = `
      <div class="room-info">
        <h4>${roomTypeName(room.room_type)} &mdash; <span style="font-family:var(--sans);font-size:0.85rem">${room.room_id}</span></h4>
        <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; Sleeps ${room.capacity}</div>
      </div>
      <div class="room-rate">${rateStr(room.rate_low, room.rate_high)}</div>
      <button class="btn-select" data-id="${room.room_id}">Select</button>
    `;

    list.appendChild(row);
  });

  container.appendChild(list);

  // Single event listener on the list (event delegation)
  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-select");
    if (!btn) return;
    const room = rooms.find((r) => r.room_id === btn.dataset.id);
    if (room) pickRoom(room, list);
  });
}

/** Handle room selection. */
function pickRoom(room, listEl) {
  selectedRoom = room;

  // Highlight selected row
  listEl.querySelectorAll(".room-row").forEach((r) => {
    r.classList.toggle("selected-row", r.dataset.id === room.room_id);
  });

  // Fill room input
  const input = document.getElementById("selected-room");
  input.value = room.room_id;
  input.classList.add("has-value");

  // Scroll to booking section
  document.getElementById("book-section")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

// ══════════════════════════════════════════════════════════════
//  SECTION 2 — BOOK (create_booking)
// ══════════════════════════════════════════════════════════════

document.getElementById("book-btn").addEventListener("click", async () => {
  const roomId    = (document.getElementById("selected-room").value || "").trim();
  const guestName = (document.getElementById("guest-name").value   || "").trim();

  // — Validate
  if (!roomId) {
    showMsg("book-status", "warning",
      "No room selected. Go to Step 1 and click &laquo;Select&raquo; next to a room.");
    return;
  }
  if (!guestName) {
    showMsg("book-status", "warning", "Please enter the guest name.");
    return;
  }
  if (!searchDates.check_in || !searchDates.check_out) {
    showMsg("book-status", "warning",
      "No stay dates selected. Please search for rooms in Step 1 first.");
    return;
  }

  // — Call API
  setBusy("book-btn", true);
  showMsg("book-status", "loading", "Creating your booking…");
  document.getElementById("booking-result").classList.add("hidden");

  try {
    const { ok, status, data } = await callFn("create_booking", {
      room_id:    roomId,
      guest_name: guestName,
      check_in:   searchDates.check_in,
      check_out:  searchDates.check_out,
    });

    // HTTP 409 — conflict
    if (status === 409) {
      showMsg("book-status", "error",
        "This room is no longer available for the selected dates. Please choose another room.");
      return;
    }

    if (!ok) {
      showMsg("book-status", "error",
        data.error || "Unable to complete your booking. Please try again later.");
      return;
    }

    // Success
    showMsg("book-status", "success", "Booking confirmed! Please save your booking ID below.");
    renderBookingPanel(data.booking_id, roomId, guestName,
      searchDates.check_in, searchDates.check_out);

    // Auto-fill cancel section
    document.getElementById("booking-id-input").value = data.booking_id;

  } catch (err) {
    showMsg("book-status", "error", `Connection error: ${err.message}`);
  } finally {
    setBusy("book-btn", false);
  }
});

/** Render the booking confirmation panel with booking ID. */
function renderBookingPanel(bookingId, roomId, guestName, checkIn, checkOut) {
  const panel  = document.getElementById("booking-result");
  const copyId = "copy-bid-btn";

  panel.innerHTML = `
    <div class="bp-label">Booking ID — keep this number in case you need to cancel</div>
    <div class="bp-code">${bookingId}</div>
    <div class="bp-detail">
      ${roomId} &nbsp;·&nbsp; ${guestName} &nbsp;·&nbsp; ${checkIn} → ${checkOut}
    </div>
    <button class="btn-copy" id="${copyId}">Copy Booking ID</button>
  `;

  panel.classList.remove("hidden");

  document.getElementById(copyId).addEventListener("click", () => {
    navigator.clipboard.writeText(bookingId)
      .then(() => {
        const btn = document.getElementById(copyId);
        btn.textContent = "Copied ✓";
        setTimeout(() => { btn.textContent = "Copy Booking ID"; }, 2200);
      })
      .catch(() => {
        // Fallback for browsers that block clipboard API
        prompt("Copy your Booking ID:", bookingId);
      });
  });
}

// ══════════════════════════════════════════════════════════════
//  SECTION 3 — CANCEL (cancel_booking)
// ══════════════════════════════════════════════════════════════

document.getElementById("cancel-btn").addEventListener("click", async () => {
  const bookingId = (document.getElementById("booking-id-input").value || "").trim();

  if (!bookingId) {
    showMsg("cancel-status", "warning", "Please enter the Booking ID you want to cancel.");
    return;
  }

  const confirmed = window.confirm(
    `Cancel this booking?\n\n${bookingId}\n\nThis action cannot be undone.`
  );
  if (!confirmed) return;

  setBusy("cancel-btn", true);
  showMsg("cancel-status", "loading", "Cancelling your booking…");

  try {
    const { ok, status, data } = await callFn("cancel_booking", {
      booking_id: bookingId,
    });

    if (status === 404) {
      showMsg("cancel-status", "error",
        "Booking not found. Please check the Booking ID and try again.");
      return;
    }
    if (status === 400) {
      showMsg("cancel-status", "warning",
        data.error || "This booking cannot be cancelled (it may already have been cancelled).");
      return;
    }
    if (!ok) {
      showMsg("cancel-status", "error",
        data.error || "Unable to cancel your booking. Please try again later.");
      return;
    }

    // Success
    showMsg("cancel-status", "success",
      `Booking <strong>${bookingId}</strong> has been cancelled successfully.`);
    document.getElementById("booking-id-input").value = "";

  } catch (err) {
    showMsg("cancel-status", "error", `Connection error: ${err.message}`);
  } finally {
    setBusy("cancel-btn", false);
  }
});
