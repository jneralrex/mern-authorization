// backend/utils/roomId.js
export default function generateRoomId(id1, id2) {
    return [id1, id2].sort().join("_");
  }
  