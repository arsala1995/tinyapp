const getUserByEmail = function (usersDB, email) {
  for (let user in usersDB) {

    if (usersDB[user]["email"] === email) {
      return usersDB[user];
    }

  }
  return null;
}

module.exports = getUserByEmail;