import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { FaCamera, FaMicrophone, FaSmile, FaPhoneAlt, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import API from "../../utils/Api.jsx";
import generateRoomId from "../../utils/RoomId.jsx";

const socket = io(); // Replace with your backend URL

const MessageHolder = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [file, setFile] = useState(null);

  const roomId =
    selectedPerson && currentUser
      ? generateRoomId(currentUser.user._id, selectedPerson._id)
      : null;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/user/all-users", {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        setUsers(res.data.users || []);
        console.log("get all users", res);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users. Please try again.");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isOpen && selectedPerson) {
      document.querySelector("input[type='text']").focus();
    }
  }, [isOpen, selectedPerson]);

  useEffect(() => {
    if (selectedPerson) {
      const room = generateRoomId(currentUser.user._id, selectedPerson._id);

      console.log("Emitting join_room with:", { currentUser: currentUser.user, selectedPerson });
      console.log("Current user:", currentUser.user._id);
      console.log("Selected person:", selectedPerson._id);
      // Emit join_room event with currentUser and selectedPerson
      socket.emit("join_room", { currentUser: currentUser.user, selectedPerson });

      socket.on("chat_history", (history) => {
        setMessages(history); // Update messages only for the selected person
      });

      socket.on("receive_message", (data) => {
        // Add the incoming message to the current messages
        if (data.room === room) {
          setMessages((prev) => [...prev, data]);
        }
      });

      socket.on("user_typing", ({ isTyping }) => setIsTyping(isTyping));

      return () => {
        socket.off("chat_history");
        socket.off("receive_message");
        socket.off("user_typing");
      };
    }
  }, [selectedPerson, currentUser]);

  const toggleMessagePanel = () => setIsOpen(!isOpen);

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    socket.emit("join_room", { currentUser: currentUser.user, selectedPerson: person });
  };

  const handleSendMessage = () => {
    if (!message.trim() && !file) return;

    const messageData = {
      content: message.trim(),
      senderId: currentUser.user._id,
      receiverId: selectedPerson._id,
      room: roomId,
      mediaFile: file,
      mediaType: file ? file.type.split("/")[0] : null,
    };

    socket.emit("send_message", messageData);
    setMessage("");
    setFile(null);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.on("user_typing", ({ isTyping, room }) => {
      if (room === roomId) {
        setIsTyping(isTyping);
      }
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCloseInbox = () => setSelectedPerson(null);

  return (
    <div
      className={`fixed bottom-0 right-0 z-50 flex flex-col transition-transform ${
        isOpen ? "translate-y-0" : "translate-y-[calc(100%-50px)]"
      } bg-white shadow-lg border-t border-gray-300 rounded-t-lg`}
      style={{
        width: "100%",
        maxWidth: "400px",
        height: isOpen ? "100vh" : "50px",
        maxHeight: isOpen ? "90vh" : "50px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between bg-blue-600 text-white p-4 cursor-pointer"
        onClick={toggleMessagePanel}
      >
        <h2 className="text-lg font-bold">Messages</h2>
        <span
          className={`transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </div>

      {/* User List */}
      {isOpen && !selectedPerson && (
        <div className="flex-1 overflow-y-auto p-4">
          <ul>
            {users.length === 0 && !error && <div className="spinner"></div>}
            {users.map((user) => (
              <li
                key={user._id}
                className="p-2 border-b border-gray-200 text-red-700 cursor-pointer"
                onClick={() => handlePersonClick(user)}
              >
                <div className="flex flex-row items-center gap-1">
                  <img
                    src={user.profilePhoto}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <p className="text-black">{user.username}</p>
                </div>
              </li>
            ))}
          </ul>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {/* Chat Section */}
      {isOpen && selectedPerson && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
            <div className="flex items-center space-x-3">
              <img
                src={selectedPerson.profilePhoto || "/default-profile.png"}
                alt={selectedPerson.username || "User"}
                className="w-10 h-10 rounded-full"
              />
              <h3 className="text-lg font-bold text-gray-600">
                {selectedPerson.username}
              </h3>
            </div>
            <button className="text-red-600" onClick={handleCloseInbox}>
              <FaTimes size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-4 ${
                  msg.senderId === currentUser.user._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs ${
                    msg.senderId === currentUser.user._id
                      ? "bg-blue-100 text-right"
                      : "bg-gray-100 text-left"
                  }`}
                >
                  <p className="text-sm text-blue-900">{msg.content}</p>
                  {msg.mediaUrl && (
                    <img
                      src={msg.mediaUrl}
                      alt="media"
                      className="mt-2 rounded-lg"
                    />
                  )}
                </div>
              </div>
            ))}
            {isTyping && <p className="text-sm text-red-500">Typing...</p>}
          </div>

          {/* Input Section */}
          <div className="p-4 bg-gray-100 flex items-center space-x-2">
            <FaSmile className="text-blue-600 cursor-pointer" size={24} />
            <FaMicrophone
              className={`cursor-pointer ${
                isRecording ? "text-red-600" : "text-blue-600"
              }`}
              size={24}
             // onClick={handleVoiceNote}
            />
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <FaCamera className="text-blue-600 cursor-pointer" size={24} />
            </label>
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              className="flex-1 p-2 border rounded-md text-gray-500"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() && !file}
              className={`bg-blue-600 text-white p-2 rounded-md ${
                !message.trim() && !file ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageHolder;