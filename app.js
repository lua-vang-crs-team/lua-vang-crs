/* ============================================================
   LỤA VÀNG RESORT & SPA — BOOKING FRONTEND
   app.js — Search → Book → Cancel
   ============================================================ */


// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL =
  "https://scxjezoysmwyumyebuls.supabase.co";

const ANON_KEY =
  "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";

const FN_BASE =
  `${SUPABASE_URL}/functions/v1`;


// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────

let searchDates = {
  check_in: null,
  check_out: null,
};

// Physical room selected internally.
// Customer only sees room type.
let selectedRoom = null;


// ─────────────────────────────────────────────────────────────
// CORE API CALL
// ─────────────────────────────────────────────────────────────

/**
 * POST to a Supabase Edge Function.
 *
 * @param {string} name
 * @param {object} body
 * @returns {{ ok: boolean, status: number, data: object }}
 */
async function callFn(name, body) {
  const res = await fetch(`${FN_BASE}/${name}`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
      "apikey": ANON_KEY,
    },

    body: JSON.stringify(body),
  });

  let data = {};

  try {
    data = await res.json();
  } catch {
    // Empty response
  }

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
}


// ─────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────

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


function setBusy(btnId, busy) {
  const btn = document.getElementById(btnId);

  btn.disabled = busy;

  if (busy) {
    btn.dataset.orig = btn.textContent;
    btn.textContent = "Đang xử lý…";
  } else {
    btn.textContent =
      btn.dataset.orig || btn.textContent;
  }
}


// ─────────────────────────────────────────────────────────────
// FORMATTING
// ─────────────────────────────────────────────────────────────

function vnd(n) {
  return (
    Number(n).toLocaleString("vi-VN") +
    " ₫"
  );
}


function rateStr(low, high) {
  if (
    low &&
    high &&
    String(low) !== String(high)
  ) {
    return (
      `${vnd(low)} – ${vnd(high)}/đêm`
    );
  }

  if (low) {
    return `${vnd(low)}/đêm`;
  }

  return "Liên hệ";
}


function roomTypeName(type) {
  return type || "Phòng";
}


// ─────────────────────────────────────────────────────────────
// DATE INITIALISATION
// ─────────────────────────────────────────────────────────────

(function initDates() {
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const ciEl =
    document.getElementById("check-in");

  const coEl =
    document.getElementById("check-out");

  ciEl.min = today;
  coEl.min = today;

  ciEl.addEventListener("change", () => {
    coEl.min = ciEl.value;

    if (
      coEl.value &&
      coEl.value <= ciEl.value
    ) {
      coEl.value = "";
    }
  });
})();


// ═════════════════════════════════════════════════════════════
// SECTION 1 — SEARCH
// check_availability
// ═════════════════════════════════════════════════════════════

document
  .getElementById("search-btn")
  .addEventListener(
    "click",
    async () => {
      const checkIn =
        document.getElementById(
          "check-in",
        ).value;

      const checkOut =
        document.getElementById(
          "check-out",
        ).value;


      // ── Validate input
      if (!checkIn || !checkOut) {
        showMsg(
          "search-status",
          "warning",
          "Vui lòng chọn cả ngày nhận và trả phòng.",
        );

        return;
      }


      if (checkIn >= checkOut) {
        showMsg(
          "search-status",
          "error",
          "Ngày nhận phòng phải trước ngày trả phòng.",
        );

        return;
      }


      // ── Reset previous state
      searchDates = {
        check_in: checkIn,
        check_out: checkOut,
      };

      selectedRoom = null;


      const roomInput =
        document.getElementById(
          "selected-room",
        );

      roomInput.value = "";
      roomInput.classList.remove(
        "has-value",
      );


      document.getElementById(
        "rooms-container",
      ).innerHTML = "";


      hideMsg("book-status");


      // ── Call backend
      setBusy("search-btn", true);

      showMsg(
        "search-status",
        "loading",
        "Đang kiểm tra phòng trống…",
      );


      try {
        const {
          ok,
          data,
        } = await callFn(
          "check_availability",
          {
            check_in: checkIn,
            check_out: checkOut,
          },
        );


        if (!ok) {
          showMsg(
            "search-status",
            "error",
            data.error ||
              "Không thể kết nối backend. Thử lại sau.",
          );

          return;
        }


        const rooms =
          data.available_rooms || [];


        if (rooms.length === 0) {
          showMsg(
            "search-status",
            "warning",
            "Không có phòng trống trong khoảng thời gian này. Vui lòng chọn ngày khác.",
          );

          return;
        }


        // Count available room types
        const roomTypes =
          new Set(
            rooms.map(
              (room) =>
                room.room_type,
            ),
          );


        showMsg(
          "search-status",
          "success",
          `Tìm thấy <strong>${rooms.length}</strong> phòng trống thuộc <strong>${roomTypes.size}</strong> hạng phòng.`,
        );


        renderRooms(rooms);

      } catch (err) {
        showMsg(
          "search-status",
          "error",
          `Lỗi kết nối: ${err.message}`,
        );

      } finally {
        setBusy(
          "search-btn",
          false,
        );
      }
    },
  );


// ─────────────────────────────────────────────────────────────
// RENDER AVAILABLE ROOM TYPES
// ─────────────────────────────────────────────────────────────

function renderRooms(rooms) {
  const container =
    document.getElementById(
      "rooms-container",
    );

  container.innerHTML = "";


  // Group physical rooms by room_type
  const grouped = {};


  rooms.forEach((room) => {
    const type =
      room.room_type || "Phòng";


    if (!grouped[type]) {
      grouped[type] = {
        type,
        rooms: [],
      };
    }


    grouped[type].rooms.push(
      room,
    );
  });


  const groups =
    Object.values(grouped);


  const list =
    document.createElement("div");

  list.className = "room-list";


  groups.forEach((group) => {
    // All rooms in the same category
    // have the same descriptive data.
    const sampleRoom =
      group.rooms[0];


    const row =
      document.createElement("div");

    row.className = "room-row";

    row.dataset.type =
      group.type;


    row.innerHTML = `
      <div class="room-info">

        <h4>
          ${roomTypeName(group.type)}
        </h4>

        <div class="room-meta">

          ${sampleRoom.size_sqm} m²

          &ensp;&middot;&ensp;

          ${sampleRoom.capacity} người

          &ensp;&middot;&ensp;

          <strong>
            ${group.rooms.length} phòng còn trống
          </strong>

        </div>

      </div>

      <div class="room-rate">

        ${rateStr(
          sampleRoom.rate_low,
          sampleRoom.rate_high,
        )}

      </div>

      <button
        class="btn-select"
        data-type="${group.type}"
      >
        Chọn
      </button>
    `;


    list.appendChild(row);
  });


  container.appendChild(list);


  // One event listener for all room types
  list.addEventListener(
    "click",
    (e) => {
      const btn =
        e.target.closest(
          ".btn-select",
        );


      if (!btn) {
        return;
      }


      const group =
        groups.find(
          (g) =>
            g.type ===
            btn.dataset.type,
        );


      if (group) {
        pickRoomType(
          group,
          list,
        );
      }
    },
  );
}


// ─────────────────────────────────────────────────────────────
// SELECT ROOM TYPE
// ─────────────────────────────────────────────────────────────

function pickRoomType(
  group,
  listEl,
) {
  /*
   * Customer selects a ROOM TYPE.
   *
   * Internally, the system assigns
   * one available physical room_id
   * from that category.
   */
  const room =
    group.rooms[0];


  selectedRoom = room;


  // Highlight selected category
  listEl
    .querySelectorAll(
      ".room-row",
    )
    .forEach((row) => {
      row.classList.toggle(
        "selected-row",
        row.dataset.type ===
          group.type,
      );
    });


  /*
   * Customer sees room TYPE,
   * not internal physical room ID.
   */
  const input =
    document.getElementById(
      "selected-room",
    );


  input.value =
    group.type;


  input.classList.add(
    "has-value",
  );


  document
    .getElementById(
      "book-section",
    )
    .scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
}


// ═════════════════════════════════════════════════════════════
// SECTION 2 — BOOK
// create_booking
// ═════════════════════════════════════════════════════════════

document
  .getElementById("book-btn")
  .addEventListener(
    "click",
    async () => {

      /*
       * IMPORTANT:
       * Use internal selected physical room_id.
       * Do NOT read the room type text field.
       */
      const roomId =
        selectedRoom?.room_id || "";


      const guestName =
        (
          document.getElementById(
            "guest-name",
          ).value || ""
        ).trim();


      // ── Validate selected room
      if (!roomId) {
        showMsg(
          "book-status",
          "warning",
          "Chưa chọn hạng phòng. Hãy tìm phòng ở bước 1 và nhấn «Chọn».",
        );

        return;
      }


      // ── Validate guest name
      if (!guestName) {
        showMsg(
          "book-status",
          "warning",
          "Vui lòng nhập tên khách lưu trú.",
        );

        return;
      }


      // ── Validate dates
      if (
        !searchDates.check_in ||
        !searchDates.check_out
      ) {
        showMsg(
          "book-status",
          "warning",
          "Chưa có ngày lưu trú. Quay lại bước 1 để tìm phòng.",
        );

        return;
      }


      setBusy(
        "book-btn",
        true,
      );


      showMsg(
        "book-status",
        "loading",
        "Đang tạo đặt phòng…",
      );


      document
        .getElementById(
          "booking-result",
        )
        .classList.add(
          "hidden",
        );


      try {
        const {
          ok,
          status,
          data,
        } = await callFn(
          "create_booking",
          {
            room_id: roomId,
            guest_name:
              guestName,
            check_in:
              searchDates.check_in,
            check_out:
              searchDates.check_out,
          },
        );


        // ── Booking conflict
        if (status === 409) {
          showMsg(
            "book-status",
            "error",
            "Hạng phòng này vừa có thay đổi tình trạng phòng. Vui lòng tìm lại phòng trống và thử lại.",
          );

          selectedRoom = null;

          document.getElementById(
            "selected-room",
          ).value = "";

          return;
        }


        // ── Other backend errors
        if (!ok) {
          showMsg(
            "book-status",
            "error",
            data.error ||
              "Không thể tạo booking. Thử lại sau.",
          );

          return;
        }


        // ── Success
        showMsg(
          "book-status",
          "success",
          "Đặt phòng thành công. Lưu lại mã đặt phòng bên dưới.",
        );


        renderBookingPanel(
          data.booking_id,
          selectedRoom,
          guestName,
          searchDates.check_in,
          searchDates.check_out,
        );


        // Auto-fill Cancel section
        document.getElementById(
          "booking-id-input",
        ).value =
          data.booking_id;


      } catch (err) {
        showMsg(
          "book-status",
          "error",
          `Lỗi kết nối: ${err.message}`,
        );

      } finally {
        setBusy(
          "book-btn",
          false,
        );
      }
    },
  );


// ─────────────────────────────────────────────────────────────
// BOOKING CONFIRMATION PANEL
// ─────────────────────────────────────────────────────────────

function renderBookingPanel(
  bookingId,
  room,
  guestName,
  checkIn,
  checkOut,
) {
  const panel =
    document.getElementById(
      "booking-result",
    );


  const copyId =
    "copy-bid-btn";


  panel.innerHTML = `
    <div class="bp-label">
      Mã đặt phòng — lưu lại để dùng khi cần hủy
    </div>

    <div class="bp-code">
      ${bookingId}
    </div>

    <div class="bp-detail">

      ${roomTypeName(
        room.room_type,
      )}

      &nbsp;·&nbsp;

      ${guestName}

      &nbsp;·&nbsp;

      ${checkIn} → ${checkOut}

    </div>

    <button
      class="btn-copy"
      id="${copyId}"
    >
      Sao chép mã
    </button>
  `;


  panel.classList.remove(
    "hidden",
  );


  document
    .getElementById(copyId)
    .addEventListener(
      "click",
      () => {

        navigator.clipboard
          .writeText(
            bookingId,
          )

          .then(() => {
            const btn =
              document.getElementById(
                copyId,
              );

            btn.textContent =
              "Đã sao chép ✓";


            setTimeout(
              () => {
                btn.textContent =
                  "Sao chép mã";
              },
              2200,
            );
          })

          .catch(() => {
            prompt(
              "Sao chép mã booking:",
              bookingId,
            );
          });
      },
    );
}


// ═════════════════════════════════════════════════════════════
// SECTION 3 — CANCEL
// cancel_booking
// ═════════════════════════════════════════════════════════════

document
  .getElementById(
    "cancel-btn",
  )
  .addEventListener(
    "click",
    async () => {

      const bookingId =
        (
          document.getElementById(
            "booking-id-input",
          ).value || ""
        ).trim();


      if (!bookingId) {
        showMsg(
          "cancel-status",
          "warning",
          "Vui lòng nhập mã đặt phòng cần hủy.",
        );

        return;
      }


      const confirmed =
        window.confirm(
          `Xác nhận hủy đặt phòng:\n\n${bookingId}\n\nHành động này không thể hoàn tác.`,
        );


      if (!confirmed) {
        return;
      }


      setBusy(
        "cancel-btn",
        true,
      );


      showMsg(
        "cancel-status",
        "loading",
        "Đang xử lý hủy đặt phòng…",
      );


      try {
        const {
          ok,
          status,
          data,
        } = await callFn(
          "cancel_booking",
          {
            booking_id:
              bookingId,
          },
        );


        // ── Booking not found
        if (status === 404) {
          showMsg(
            "cancel-status",
            "error",
            "Không tìm thấy booking này. Kiểm tra lại mã đặt phòng.",
          );

          return;
        }


        // ── Already cancelled / invalid state
        if (status === 400) {
          showMsg(
            "cancel-status",
            "warning",
            data.error ||
              "Booking này không ở trạng thái có thể hủy.",
          );

          return;
        }


        // ── Other backend errors
        if (!ok) {
          showMsg(
            "cancel-status",
            "error",
            data.error ||
              "Không thể hủy booking. Thử lại sau.",
          );

          return;
        }


        // ── Success
        showMsg(
          "cancel-status",
          "success",
          `Đã hủy thành công booking <strong>${bookingId}</strong>.`,
        );


        document.getElementById(
          "booking-id-input",
        ).value = "";


      } catch (err) {
        showMsg(
          "cancel-status",
          "error",
          `Lỗi kết nối: ${err.message}`,
        );

      } finally {
        setBusy(
          "cancel-btn",
          false,
        );
      }
    },
  );
