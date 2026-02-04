const { io } = require("socket.io-client");

const socket = io("http://localhost:3030", {
  transports: ["websocket"],
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("✅ connected:", socket.id);

  socket.emit("fake_event", { msg: "hello from test client" }, (ack) => {
    console.log("✅ ack:", ack);
  });
});

socket.on("connect_error", (err) => {
  console.log("❌ connect_error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("⚠️ disconnected:", reason);
});

socket.on("user_online", (payload) => {
  console.log("🟢 USER ONLINE:", payload);
});
