updateState()

window.doorState = 'unknown'

function updateState() {
  request('/state', function(err, data) {
    if (err) document.body.className = 'unknown'
    if (data) {
      window.doorState = document.body.className = data.state || 'unknown'
    }
    setTimeout(updateState, 5000)
  })
}

var link = document.querySelector('.toggle a')
link.addEventListener('click', toggleClicked, false)
function toggleClicked(ev) {
  var url = window.doorState == 'closed' ? '/open' : '/close'
  request(url, function(err, data) { })
  ev.preventDefault()
  return false
}


function request(url, callback) {
  function handler() {
    if (this.responseText) {
      var data = null
      try {
        data = JSON.parse(this.responseText)
      } catch(ex) { console.error(ex) }
      callback(null, data)
    }
  }

  function xferError(ev) { callback(ev) }

  var req = new XMLHttpRequest()
  req.addEventListener('error', xferError, false)
  req.onload = handler
  req.open('get', url+'/'+window.doorID, true)
  req.send()
}
