// File: backend/utils/roomId.js
const generateRoomId = (id1, id2) => {
  return [id1, id2].sort().join("_");
};

module.exports = generateRoomId; // Use CommonJS export
