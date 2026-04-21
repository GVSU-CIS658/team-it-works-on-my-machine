const authProfile = require('./authProfile')
const groups = require('./groups')
const tasks = require('./tasks')

module.exports = {
  ...authProfile,
  ...groups,
  ...tasks,
}
