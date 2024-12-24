 const generateRoomId = (id1, id2) => {
    return [id1, id2].sort().join("_");
  };  

  module.exports = generateRoomId;
  