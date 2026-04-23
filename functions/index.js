const authProfile = require('./authProfile')
const groups = require('./groups')
const sessions = require('./sessions')
const tasks = require('./tasks')

module.exports = {
  ...authProfile,
  ...groups,
  ...sessions,
  ...tasks,
}
