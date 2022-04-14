let userList = [
    {
        id: "1", username: "Christian", room: "room1"
    },
    {
        id: "2", username: "Messi", room: "room1"
    },
    {
        id: "3", username: "Lampard", room: "room2"
    },
    {
        id: "4", username: "Rooney", room: "room2"
    },
]

const addUser = (newUser) => userList = [...userList, newUser];
const getUserList = (room) => userList.filter((user) => user.room == room);
const removeUser = (id) => (userList = userList.filter((user) => user.id != id));
const findUser = (id) => userList.find((user) => user.id == id);

module.exports = {
    getUserList,
    addUser,
    removeUser,
    findUser
}