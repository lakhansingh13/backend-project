const getUsers = (req, res) => {
 res.json({ message: "Fetching all users from Database..." });
};

module.exports = { getUsers };
