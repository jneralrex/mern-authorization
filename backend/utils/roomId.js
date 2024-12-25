const generateRoomId = (user1, user2) => {
  const ids = [user1._id, user2._id].sort();
  return `${ids[0]}_${ids[1]}`;
};

module.exports = generateRoomId;