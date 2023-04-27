
var BookingManager = function() {
    function getParameters() {
        const params = window.location.href.split("?")[1]
        if (typeof(params) === 'undefined') {
            return ""
        } else {
            return "?" + params
        }
    }
    function getHashCode() {
        const hash = window.location.href.split("?")[0].split("#")[1]
        if (typeof(hash) === 'undefined') {
            return ""
        } else {
            return "#" + hash.split("-")[0]
        }
    }
    function getServer() {
        const server = window.location.href.split("?")[0].split("#")[0]
        if (typeof(server) === 'undefined') {
            return ""
        } else {
            return server
        }
    }
    const searchParams = new URLSearchParams(getParameters());
    const date = searchParams.get("date")
    console.log("BookingManager() params=[" + date + "]")
        function startCalendar() {
            document.addEventListener('DOMContentLoaded', function() {
              const calendarEl = document.getElementById('calendar')
              const calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                contentHeight: 'auto',
                dateClick: function(info) {
                  console.log('Clicked on: ' + info.dateStr);
                    function sendURLTOParent (params) {
                        // Get a reference to the parent window
                        var parentWindow = window.parent;

                        // Create a message object
                        var message = {
                            operation: "seturistate",
                            newhref: params
                        }

                        // Send the message to the parent window
                        parentWindow.postMessage(JSON.stringify(message), "*");
                        console.log("message posted [" + JSON.stringify(message) + "]")
                    }
                    function getNewParameters() {
                        const params = window.location.href.split("?")[1]
                        if (typeof(params) === 'undefined') {
                            return "?date=" + info.dateStr
                        } else {
                            return "?date=" + info.dateStr + "&" + params
                        }
                    }
                  const timeselect = info.dateStr.split("T")[1]
                  if (typeof(timeselect) === "undefined") {
                      calendar.changeView('timeGridDay', info.dateStr);
                      const state = { user: 12 };
                      const title = 'My new page';
                      const params = getNewParameters()
                      console.log("new state url=[" + params + "] href=[" + window.location.href + "]")
                      //window.location.href = url
                      //history.pushState(state, title, url);
                      sendURLTOParent(params)
                  }
                },
                  headerToolbar: {
                      center: '',
                      end: 'prev,next',
                  },
                views: {
                    timeGridDay: {
                        buttonText: 'My Button',
                        type: 'timeGridDay',
                        allDaySlot: false,
                        slotMinTime: '10:00:00',
                        slotDuration: '00:30:00',
                    }
                }
              })
              if (date != null) {
                  console.log("select date = [" + date + "]")
                  calendar.changeView('timeGridDay', date);
              }
              calendar.render()
            })
        }
        startCalendar()

    return {
        show: function() {
            console.log("Booking manager.")
        }
    }
}
