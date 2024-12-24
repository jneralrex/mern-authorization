// Change CommonJS export to ES Module export
const generateRoomId = (id1, id2) => {
  return [id1, id2].sort().join("_");
};

export default generateRoomId;
